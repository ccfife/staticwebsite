import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');
import s3deploy = require ('@aws-cdk/aws-s3-deployment');
import cloudfront = require('@aws-cdk/aws-cloudfront');

//import monocdk = require('monocdk-experiment');

export class StaticwebsiteStack extends cdk.Stack {
  public readonly UrlOutput: cdk.CfnOutput

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //s3 bucket with support for website hosting
    const bucket = new s3.Bucket(this,'staticWebsite_v1',{
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: '404.html',
    });

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./web/static')],
      destinationBucket: bucket,
      destinationKeyPrefix: 'web/static'
    });
      
    //create CloudFront access identity
    const origin = new cloudfront.OriginAccessIdentity(this, 'BucketOrigin');

    //grant CloudFront access identity userid access to the s3 bucket
    bucket.grantRead(origin);

    //create cloudfront distribution
    const cdn = new cloudfront.CloudFrontWebDistribution(this, 'cloudfront', {
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.ALLOW_ALL,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
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
                cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS
            }
          ],
          originPath: '/web/static',
        }
      ]
    })

    //output cloudfront URL
    this.UrlOutput = new cdk.CfnOutput(this, 'CloudFrontURL', {
      description: 'CDN URL',
      value: "https://" + cdn.domainName
    })
    
  }
}
