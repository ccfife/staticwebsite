import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');
import s3deploy = require('@aws-cdk/aws-s3-deployment');
import cloudfront = require('@aws-cdk/aws-cloudfront');
import iam = require('@aws-cdk/aws-iam');
import cb = require('@aws-cdk/aws-codebuild');

export class StaticwebsiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //s3 bucket with support for website hosting
    const bucket = new s3.Bucket(this,'staticWebsite_v1',{
        websiteIndexDocument: 'index.html',
        websiteErrorDocument: '404.html'
      });

    //deploy local web assets to s3 bucket; TODO replace with codebuild and codepipeline
    new s3deploy.BucketDeployment(this, 'deployWebsite', {
      source: s3deploy.Source.asset('static_website/sonar-master'),
      destinationBucket: bucket,
      destinationKeyPrefix: 'web/static' 
    });

    //create codebuild project to deploy web assets stored in a GitHub repo
    new cb.Project(this, 'Learning-CDK-project', {
      environment: {buildImage: cb.LinuxBuildImage.UBUNTU_14_04_NODEJS_10_1_0}, //build environment with NodeJs
      source: cb.Source.gitHub({
        owner: 'ccfife', //github ID
        repo: 'learning-cdk', //github repo
        webhook: true //rebuild everytime a code change is pushed to this repository
        //oauthToken: cdk.SecretValue.secretsManager('ccfife_github') //read GitHub access key from Secrets Manager
      }),
      buildSpec: cb.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'npm install', //install npm dependencies in package.json
            ],
          },
          build: {
            commands: [
              'npm run build',  //compile TypeScript to JavaScript
              'npm run cdk synth -- -o dist' //synthesize CDK app and put results in 'dist'
            ],
          },
        },
        artifacts: {
          'files': [ '**/*' ],
          'base-directory': 'dist'
        }
      })
    });
      
    //create CloudFront access identity
    const origin = new cloudfront.CfnCloudFrontOriginAccessIdentity(this, 'BucketOrigin', {
      cloudFrontOriginAccessIdentityConfig: {
        comment: 'sonar master'
      }
    });

    //grant CloudFront access identity userid access to the s3 bucket
    bucket.grantRead(new iam.CanonicalUserPrincipal(
      origin.attrS3CanonicalUserId
    ));

    //create cloudfront distribution
    const cdn = new cloudfront.CloudFrontWebDistribution(this, 'cloudfront', {
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.ALLOW_ALL,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentityId: origin.ref
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
