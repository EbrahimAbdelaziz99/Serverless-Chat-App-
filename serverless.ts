import type { AWS } from '@serverless/typescript';

import functions from './serverless/functions';
import dynamoResources from './serverless/dynamoResources';

const serverlessConfiguration: AWS = {
  service: 'reminderApp',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    profile:"EbrahimSLS",
    iam:{
      role: {
        statements: [
          {
            Effect:'Allow',
            Action:'dynamodb:*',
            Resource:'arn:aws:dynamodb:${self:provider.region}:${aws:accountId}:table/${self:custom.reminderTable}'
          }
        ]
      }
    },
    region:"me-south-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      
      reminderTable:'${self:custom.reminderTable}',

      baseUrl:{
        'Fn::Join':[
          "",
          [
            "https://",
            {Ref:"HttpApi"},
            ".execute-api.${self:provider.region}.amazonaws.com"
          ]
        ]
      }
    },
  },
  // import the function via paths

  functions,
  
  package: { individually: true },

  resources:{
    Resources: {
      ...dynamoResources,
    }
  },

  custom: {

    reminderTable:'${sls:stage}-reminder-table',

    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;