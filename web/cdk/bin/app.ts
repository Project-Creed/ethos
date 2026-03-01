import * as cdk from "aws-cdk-lib";
import { EthosStack } from "../lib/ethos-stack";

const app = new cdk.App();

new EthosStack(app, "EthosStack", {
  // CloudFront certificates must live in us-east-1
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
});
