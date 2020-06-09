import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');
import cloudfront = require('@aws-cdk/aws-cloudfront');
import iam = require('@aws-cdk/aws-iam');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import pipelineAction = require('@aws-cdk/aws-codepipeline-actions');

export class StaticwebsiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //s3 bucket with support for website hosting
    const bucket = new s3.Bucket(this,'staticWebsite_v1',{
        websiteIndexDocument: 'index.html',
        websiteErrorDocument: '404.html',
      });

    //create CodePipeline stages to deploy the static website from GitHub to S3
    //create the CodePipeline service instance
    const pipeline = new codepipeline.Pipeline(this, 'CDKStaticWebsitePipeline', {
      pipelineName: 'SonarMasterPipeline'
    });
    
    const sourceOutput = new codepipeline.Artifact();

    //read the GitHub access key from SecretValue using the 'GitHub' name/value pair
    const token = cdk.SecretValue.secretsManager('ccfife_github', {
      jsonField: 'GitHub'
    });

    //create new codepipeline GitHub SOURCE stage
    const sourceAction = new pipelineAction.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: 'ccfife',
      repo: 'staticwebsite',
      output: sourceOutput,
      oauthToken: token,
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction]
    })
    
    //create a new codepipeline DEPLOY stage
    const deployAction = new pipelineAction.S3DeployAction({
      actionName: 'S3Deploy',
      bucket: bucket,
      input: sourceOutput,
      extract: true,
    });

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [deployAction]
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
    new cdk.CfnOutput(this, 'CloudFrontURL', {
      description: 'CDN URL',
      value: "https://" + cdn.domainName
    })
    
  }
}
