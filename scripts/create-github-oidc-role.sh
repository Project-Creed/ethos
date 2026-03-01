#!/usr/bin/env bash
# Creates an AWS IAM role that allows GitHub Actions in project-creed/ethos
# to assume it via OIDC (no long-lived credentials needed).
#
# Run once, then set the printed ARN as vars.AWS_ROLE_ARN in:
#   GitHub → project-creed/ethos → Settings → Secrets and variables → Actions → Variables
#
# Prerequisites: aws CLI configured with credentials that can create IAM roles.

set -euo pipefail

ROLE_NAME="GitHubActions-project-creed-ethos"
GITHUB_ORG="project-creed"
GITHUB_REPO="ethos"
OIDC_URL="token.actions.githubusercontent.com"

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
OIDC_PROVIDER_ARN="arn:aws:iam::${ACCOUNT_ID}:oidc-provider/${OIDC_URL}"

echo "AWS account: ${ACCOUNT_ID}"
echo "Role name:   ${ROLE_NAME}"
echo ""

# ── 1. Ensure the GitHub OIDC provider exists ─────────────────────────────────
if aws iam get-open-id-connect-provider --open-id-connect-provider-arn "${OIDC_PROVIDER_ARN}" \
     > /dev/null 2>&1; then
  echo "✓ OIDC provider already exists: ${OIDC_PROVIDER_ARN}"
else
  echo "Creating OIDC provider..."
  aws iam create-open-id-connect-provider \
    --url "https://${OIDC_URL}" \
    --client-id-list "sts.amazonaws.com" \
    --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1" \
                      "1c58a3a8518e8759bf075b76b750d4f2df264fcd"
  echo "✓ OIDC provider created"
fi

# ── 2. Create the trust policy ────────────────────────────────────────────────
TRUST_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "${OIDC_PROVIDER_ARN}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "${OIDC_URL}:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "${OIDC_URL}:sub": "repo:${GITHUB_ORG}/${GITHUB_REPO}:*"
        }
      }
    }
  ]
}
EOF
)

# ── 3. Create the role (or skip if it already exists) ─────────────────────────
if aws iam get-role --role-name "${ROLE_NAME}" > /dev/null 2>&1; then
  echo "✓ Role already exists: ${ROLE_NAME}"
  echo "  Updating trust policy..."
  aws iam update-assume-role-policy \
    --role-name "${ROLE_NAME}" \
    --policy-document "${TRUST_POLICY}"
  echo "✓ Trust policy updated"
else
  echo "Creating role ${ROLE_NAME}..."
  aws iam create-role \
    --role-name "${ROLE_NAME}" \
    --assume-role-policy-document "${TRUST_POLICY}" \
    --description "Assumed by GitHub Actions in ${GITHUB_ORG}/${GITHUB_REPO} via OIDC"
  echo "✓ Role created"
fi

# ── 4. Attach AdministratorAccess ─────────────────────────────────────────────
# CDK bootstrap + deploy needs broad permissions (CloudFormation, S3, Lambda,
# CloudFront, ACM, Route53, IAM role creation for Lambda execution, etc.)
aws iam attach-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-arn "arn:aws:iam::aws:policy/AdministratorAccess"
echo "✓ AdministratorAccess attached"

# ── 5. Print the ARN ──────────────────────────────────────────────────────────
ROLE_ARN=$(aws iam get-role --role-name "${ROLE_NAME}" --query Role.Arn --output text)

echo ""
echo "════════════════════════════════════════════════════════"
echo "Role ARN (set this as vars.AWS_ROLE_ARN in GitHub):"
echo ""
echo "  ${ROLE_ARN}"
echo ""
echo "GitHub repo settings URL:"
echo "  https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/settings/variables/actions"
echo "════════════════════════════════════════════════════════"
