//import cdk = require('@aws-cdk/core');
//import s3 = require('@aws-cdk/aws-s3');
//import s3deploy = require ('@aws-cdk/aws-s3-deployment');
//import cloudfront = require('@aws-cdk/aws-cloudfront');
//import { CfnOutput } from '@aws-cdk/core';

import monocdk = require('monocdk-experiment');

export class StaticwebsiteStack extends monocdk.Stack {
  public readonly UrlOutput: monocdk.CfnOutput

  constructor(scope: monocdk.Construct, id: string, props?: monocdk.StackProps) {
    super(scope, id, props);

    //s3 bucket with support for website hosting
    const bucket = new monocdk.aws_s3.Bucket(this,'staticWebsite_v1',{
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: '404.html',
    });

    new monocdk.aws_s3_deployment.BucketDeployment(this, 'DeployWebsite', {
      sources: [monocdk.aws_s3_deployment.Source.asset('./web/static')],
      destinationBucket: bucket,
      destinationKeyPrefix: 'web/static'
    });
      
    //create CloudFront access identity
    const origin = new monocdk.aws_cloudfront.OriginAccessIdentity(this, 'BucketOrigin');

    //grant CloudFront access identity userid access to the s3 bucket
    bucket.grantRead(origin);

    //create cloudfront distribution
    const cdn = new monocdk.aws_cloudfront.CloudFrontWebDistribution(this, 'cloudfront', {
      viewerProtocolPolicy: monocdk.aws_cloudfront.ViewerProtocolPolicy.ALLOW_ALL,
      priceClass: monocdk.aws_cloudfront.PriceClass.PRICE_CLASS_ALL,
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity: origin,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              allowedMethods:
                monocdk.aws_cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS
            }
          ],
          originPath: '/web/static',
        }
      ]
    })

    //output cloudfront URL
    this.UrlOutput = new monocdk.CfnOutput(this, 'CloudFrontURL', {
      description: 'CDN URL',
      value: "https://" + cdn.domainName
    })
    
  }
}
