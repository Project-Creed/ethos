import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class EthosStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Existing Route 53 hosted zone for ethosian.info
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: "Z05419822ADAN9U7LDFGI",
      zoneName: "ethosian.info",
    });

    // TLS certificate — DNS validated automatically via Route 53
    // Must be in us-east-1 for CloudFront
    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: "ethosian.info",
      subjectAlternativeNames: ["www.ethosian.info"],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // SSR Lambda — bundles server/lambda.ts + build/server/index.js + chapters/
    const ssrFunction = new nodejs.NodejsFunction(this, "SsrHandler", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "handler",
      entry: path.join(__dirname, "../../server/lambda.ts"),
      bundling: {
        minify: true,
        sourceMap: false,
        target: "es2022",
        externalModules: ["@aws-sdk/*", "aws-sdk"],
        commandHooks: {
          beforeBundling: () => [],
          beforeInstall: () => [],
          afterBundling(_inputDir: string, outputDir: string): string[] {
            // Copy chapter markdown files into the Lambda bundle so the SSR
            // handler can read them at runtime from process.cwd()/chapters/
            const chaptersSrc = path.join(__dirname, "../../..", "chapters");
            return [`cp -r "${chaptersSrc}" "${outputDir}/chapters"`];
          },
        },
      },
      timeout: cdk.Duration.seconds(10),
      memorySize: 512,
      environment: {
        NODE_ENV: "production",
      },
    });

    // Public Lambda Function URL — CloudFront sits in front
    const functionUrl = ssrFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    // Private S3 bucket for static assets (JS/CSS/favicon)
    const assetsBucket = new s3.Bucket(this, "AssetsBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(assetsBucket);

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, "Distribution", {
      // Default: all routes → Lambda (SSR, no caching)
      defaultBehavior: {
        origin: new origins.FunctionUrlOrigin(functionUrl),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      },
      additionalBehaviors: {
        // Hashed JS/CSS bundles — immutable, 1-year cache
        "/assets/*": {
          origin: s3Origin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          compress: true,
        },
        // Public files — 1-day cache
        "/favicon.svg": {
          origin: s3Origin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
      },
      domainNames: ["ethosian.info", "www.ethosian.info"],
      certificate,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
    });

    // Route 53: apex → CloudFront
    new route53.ARecord(this, "ARecord", {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    // Route 53: www → CloudFront
    new route53.ARecord(this, "WwwARecord", {
      zone: hostedZone,
      recordName: "www",
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    // Outputs — consumed by GitHub Actions to sync assets + invalidate cache
    new cdk.CfnOutput(this, "BucketName", { value: assetsBucket.bucketName });
    new cdk.CfnOutput(this, "DistributionId", { value: distribution.distributionId });
  }
}
