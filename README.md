# serverless-tag-api-gateway
Serverless plugin to tag API Gateway

## Installation

Install the plugin via <a href="https://docs.npmjs.com/cli/install">NPM</a>

```
npm install --save-dev serverless-tag-api-gateway
```

## Usage

In Serverless template:

```
custom:
  apiGatewayTags:
    TagName1: TagValue1
    TagName2: TagValue2

plugins: 
  - serverless-tag-api-gateway

```