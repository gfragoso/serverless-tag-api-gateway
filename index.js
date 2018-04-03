'use strict';

const _ = require('lodash');

let _apiGatewayService = null;
let _cloudFormationService = null;

class ServerlessSQSTagPlugin {

  get stackName() {
    return `${this.serverless.service.service}-${this.options.stage}`;
  }

  get apiGatewayService() {

    if (!_apiGatewayService)
      _apiGatewayService = new this.awsService.sdk.APIGateway({ region: this.options.region });

    return _apiGatewayService;
  }

  get cloudFormationService() {

    if (!_cloudFormationService)
      _cloudFormationService = new this.awsService.sdk.CloudFormation({ region: this.options.region });

    return _cloudFormationService;
  }

  constructor(serverless, options) {

    this.options = options;
    this.serverless = serverless;
    this.awsService = this.serverless.getProvider('aws');

    this.hooks = {
      'after:deploy:deploy': this.execute.bind(this),
    };
  }

  execute() {
    return this.getStackResources()
      .then(data => this.tagAPIGateway(data))
      .then(data => this.serverless.cli.log(JSON.stringify(data)))
      .catch(err => this.serverless.cli.log(JSON.stringify(err)));
  }

  getStackResources() {
    return new Promise((resolve, reject) => {
      this.cloudFormationService.describeStackResources({ StackName: this.stackName }, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }

  tagAPIGateway(data) {   

    const apiGatewayResources = _.filter(data.StackResources, { ResourceType: 'AWS::ApiGateway::RestApi' });

    const promises = _.map(apiGatewayResources, item => {
      return new Promise((resolve, reject) => {
        
        const params = {
          resourceArn: `arn:aws:apigateway:${this.options.region}::/restapis/${item.PhysicalResourceId}/stages/${this.options.stage}`,
          tags: this.serverless.service.custom.apiGatewayTags
        };

        this.apiGatewayService.tagResource(params, (err, data) => {
            if(err) return reject(err);
            resolve(`Tagged API gateway ${item.LogicalResourceId}`); 
        });

      });
    });

    return Promise.all(promises);
  }
}

module.exports = ServerlessSQSTagPlugin;
