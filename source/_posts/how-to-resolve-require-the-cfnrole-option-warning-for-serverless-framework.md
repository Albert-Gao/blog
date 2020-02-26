---
title: How to resolve require the cfnRole option warning for serverless framework
date: 2020-02-26 16:59:21
tags:
  - serverless
---

`Serverless framework` is an awesome tool for AWS lambda. For a new project, if you have seen this warning when deploying:

> Warned - no cfnRole set:
> Require the cfnRole option, which specifies a particular role for CloudFormation to assume while deploying.

It is a typical permission problem, let's see how to solve it.

<!--more-->

## 1. Open your AWS Console

Find the `Roles` section:

- IAM -> Access management -> Roles

Click the `Create Role` button

## 2. Create role

- `Select type of trusted entity`: AWS Service
- `Choose a use case`: `CloudFormation`

Click the `Next:Permission` button at bottom.

## 3. Attach permissions policies

Select the permissions that you need:

For me they are:

- \*`AWSConfigRole`
- \*`AWSLambdaFullAccess`
- \*`IAMFullAccess`
- \*`AmazonAPIGatewayAdministrator`
- `AWSCloudFormationFullAccess`
- `AmazonCognitoPowerUser`

The permissions with `*` are must-have. Actually, you can fully tweak the `IAMFullAccess`, but it lacks information.

Then you can `next` to the end.

## 4. Edit trust relationship

- Click the role you just created, then click `Trust relationships` tab.
- Click `Edit trust relationship` button.
- You can see a json there, add `"lambda.amazonaws.com"` to `Statement.Principal.Service`, make it an array if it is not.

The result looks like this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": ["lambda.amazonaws.com", "cloudformation.amazonaws.com"]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

## 5. End

That's all, hope it helps.
