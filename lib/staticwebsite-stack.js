"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("@aws-cdk/core");
const s3 = require("@aws-cdk/aws-s3");
const s3deploy = require("@aws-cdk/aws-s3-deployment");
const cloudfront = require("@aws-cdk/aws-cloudfront");
const iam = require("@aws-cdk/aws-iam");
const codepipeline = require("@aws-cdk/aws-codepipeline");
const pipelineAction = require("@aws-cdk/aws-codepipeline-actions");
class StaticwebsiteStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        //s3 bucket with support for website hosting
        const bucket = new s3.Bucket(this, 'staticWebsite_v1', {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: '404.html',
        });
        //s3 bucket with support for website hosting
        const otherbucket = new s3.Bucket(this, 'otherbucket', {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: '404.html',
        });
        //deploy local web assets to s3 bucket; TODO replace with codebuild and codepipeline
        new s3deploy.BucketDeployment(this, 'deployWebsite', {
            source: s3deploy.Source.asset('web/static'),
            destinationBucket: otherbucket,
            destinationKeyPrefix: 'web/static'
        });
        //create CodePipeline stages to deploy the static website from GitHub to S3
        //create the CodePipeline service instance
        const pipeline = new codepipeline.Pipeline(this, 'CDKpipeline', {
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
        });
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
        const origin = new cloudfront.CfnCloudFrontOriginAccessIdentity(this, 'BucketOrigin', {
            cloudFrontOriginAccessIdentityConfig: {
                comment: 'sonar master'
            }
        });
        //grant CloudFront access identity userid access to the s3 bucket
        bucket.grantRead(new iam.CanonicalUserPrincipal(origin.attrS3CanonicalUserId));
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
                            allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS
                        }
                    ],
                    originPath: '/web/static',
                }
            ]
        });
        //output cloudfront URL
        new cdk.CfnOutput(this, 'CloudFrontURL', {
            description: 'CDN URL',
            value: "https://" + cdn.domainName
        });
    }
}
exports.StaticwebsiteStack = StaticwebsiteStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljd2Vic2l0ZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXRpY3dlYnNpdGUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBc0M7QUFDdEMsc0NBQXVDO0FBQ3ZDLHVEQUF3RDtBQUN4RCxzREFBdUQ7QUFDdkQsd0NBQXlDO0FBQ3pDLDBEQUEyRDtBQUMzRCxvRUFBcUU7QUFFckUsTUFBYSxrQkFBbUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUMvQyxZQUFZLEtBQW9CLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQ2xFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLDRDQUE0QztRQUM1QyxNQUFNLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFDLGtCQUFrQixFQUFDO1lBQ2pELG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsb0JBQW9CLEVBQUUsVUFBVTtTQUNqQyxDQUFDLENBQUM7UUFFRiw0Q0FBNEM7UUFDL0MsTUFBTSxXQUFXLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBQyxhQUFhLEVBQUM7WUFDbkQsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxvQkFBb0IsRUFBRSxVQUFVO1NBQ2pDLENBQUMsQ0FBQztRQUVILG9GQUFvRjtRQUNyRixJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ2xELE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7WUFDM0MsaUJBQWlCLEVBQUUsV0FBVztZQUM5QixvQkFBb0IsRUFBRSxZQUFZO1NBQ3BDLENBQUMsQ0FBQztRQUVGLDJFQUEyRTtRQUMzRSwwQ0FBMEM7UUFDMUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDOUQsWUFBWSxFQUFFLHFCQUFxQjtTQUNwQyxDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxJQUFJLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVqRCxnRkFBZ0Y7UUFDaEYsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFO1lBQzVELFNBQVMsRUFBRSxRQUFRO1NBQ3BCLENBQUMsQ0FBQztRQUVILDZDQUE2QztRQUM3QyxNQUFNLFlBQVksR0FBRyxJQUFJLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQztZQUN6RCxVQUFVLEVBQUUsZUFBZTtZQUMzQixLQUFLLEVBQUUsUUFBUTtZQUNmLElBQUksRUFBRSxlQUFlO1lBQ3JCLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLFVBQVUsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDaEIsU0FBUyxFQUFFLFFBQVE7WUFDbkIsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO1NBQ3hCLENBQUMsQ0FBQTtRQUVGLHdDQUF3QztRQUN4QyxNQUFNLFlBQVksR0FBRyxJQUFJLGNBQWMsQ0FBQyxjQUFjLENBQUM7WUFDckQsVUFBVSxFQUFFLFVBQVU7WUFDdEIsTUFBTSxFQUFFLE1BQU07WUFDZCxLQUFLLEVBQUUsWUFBWTtZQUNuQixPQUFPLEVBQUUsSUFBSTtTQUNkLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDaEIsU0FBUyxFQUFFLFFBQVE7WUFDbkIsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO1NBQ3hCLENBQUMsQ0FBQztRQUVILG1DQUFtQztRQUNuQyxNQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ3BGLG9DQUFvQyxFQUFFO2dCQUNwQyxPQUFPLEVBQUUsY0FBYzthQUN4QjtTQUNGLENBQUMsQ0FBQztRQUdILGlFQUFpRTtRQUNqRSxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxDQUFDLHNCQUFzQixDQUM3QyxNQUFNLENBQUMscUJBQXFCLENBQzdCLENBQUMsQ0FBQztRQUVILGdDQUFnQztRQUNoQyxNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3ZFLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTO1lBQy9ELFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLGVBQWU7WUFDakQsYUFBYSxFQUFFO2dCQUNiO29CQUNFLGNBQWMsRUFBRTt3QkFDZCxjQUFjLEVBQUUsTUFBTTt3QkFDdEIsc0JBQXNCLEVBQUUsTUFBTSxDQUFDLEdBQUc7cUJBQ25DO29CQUNELFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxpQkFBaUIsRUFBRSxJQUFJOzRCQUN2QixjQUFjLEVBQ1osVUFBVSxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQjt5QkFDdkQ7cUJBQ0Y7b0JBQ0QsVUFBVSxFQUFFLGFBQWE7aUJBQzFCO2FBQ0Y7U0FDRixDQUFDLENBQUE7UUFFRix1QkFBdUI7UUFDdkIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdkMsV0FBVyxFQUFFLFNBQVM7WUFDdEIsS0FBSyxFQUFFLFVBQVUsR0FBRyxHQUFHLENBQUMsVUFBVTtTQUNuQyxDQUFDLENBQUE7SUFFSixDQUFDO0NBQ0Y7QUF6R0QsZ0RBeUdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNkayA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2NvcmUnKTtcbmltcG9ydCBzMyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1zMycpO1xuaW1wb3J0IHMzZGVwbG95ID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLXMzLWRlcGxveW1lbnQnKTtcbmltcG9ydCBjbG91ZGZyb250ID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWNsb3VkZnJvbnQnKTtcbmltcG9ydCBpYW0gPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtaWFtJyk7XG5pbXBvcnQgY29kZXBpcGVsaW5lID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWNvZGVwaXBlbGluZScpO1xuaW1wb3J0IHBpcGVsaW5lQWN0aW9uID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWNvZGVwaXBlbGluZS1hY3Rpb25zJyk7XG5cbmV4cG9ydCBjbGFzcyBTdGF0aWN3ZWJzaXRlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy9zMyBidWNrZXQgd2l0aCBzdXBwb3J0IGZvciB3ZWJzaXRlIGhvc3RpbmdcbiAgICBjb25zdCBidWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsJ3N0YXRpY1dlYnNpdGVfdjEnLHtcbiAgICAgICAgd2Vic2l0ZUluZGV4RG9jdW1lbnQ6ICdpbmRleC5odG1sJyxcbiAgICAgICAgd2Vic2l0ZUVycm9yRG9jdW1lbnQ6ICc0MDQuaHRtbCcsXG4gICAgICB9KTtcblxuICAgICAgIC8vczMgYnVja2V0IHdpdGggc3VwcG9ydCBmb3Igd2Vic2l0ZSBob3N0aW5nXG4gICAgY29uc3Qgb3RoZXJidWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsJ290aGVyYnVja2V0Jyx7XG4gICAgICB3ZWJzaXRlSW5kZXhEb2N1bWVudDogJ2luZGV4Lmh0bWwnLFxuICAgICAgd2Vic2l0ZUVycm9yRG9jdW1lbnQ6ICc0MDQuaHRtbCcsXG4gICAgfSk7XG5cbiAgICAvL2RlcGxveSBsb2NhbCB3ZWIgYXNzZXRzIHRvIHMzIGJ1Y2tldDsgVE9ETyByZXBsYWNlIHdpdGggY29kZWJ1aWxkIGFuZCBjb2RlcGlwZWxpbmVcbiAgIG5ldyBzM2RlcGxveS5CdWNrZXREZXBsb3ltZW50KHRoaXMsICdkZXBsb3lXZWJzaXRlJywge1xuICAgICAgc291cmNlOiBzM2RlcGxveS5Tb3VyY2UuYXNzZXQoJ3dlYi9zdGF0aWMnKSxcbiAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiBvdGhlcmJ1Y2tldCxcbiAgICAgIGRlc3RpbmF0aW9uS2V5UHJlZml4OiAnd2ViL3N0YXRpYycgXG4gICB9KTtcblxuICAgIC8vY3JlYXRlIENvZGVQaXBlbGluZSBzdGFnZXMgdG8gZGVwbG95IHRoZSBzdGF0aWMgd2Vic2l0ZSBmcm9tIEdpdEh1YiB0byBTM1xuICAgIC8vY3JlYXRlIHRoZSBDb2RlUGlwZWxpbmUgc2VydmljZSBpbnN0YW5jZVxuICAgIGNvbnN0IHBpcGVsaW5lID0gbmV3IGNvZGVwaXBlbGluZS5QaXBlbGluZSh0aGlzLCAnQ0RLcGlwZWxpbmUnLCB7XG4gICAgICBwaXBlbGluZU5hbWU6ICdTb25hck1hc3RlclBpcGVsaW5lJ1xuICAgIH0pO1xuICAgIFxuICAgIGNvbnN0IHNvdXJjZU91dHB1dCA9IG5ldyBjb2RlcGlwZWxpbmUuQXJ0aWZhY3QoKTtcblxuICAgIC8vcmVhZCB0aGUgR2l0SHViIGFjY2VzcyBrZXkgZnJvbSBTZWNyZXRWYWx1ZSB1c2luZyB0aGUgJ0dpdEh1YicgbmFtZS92YWx1ZSBwYWlyXG4gICAgY29uc3QgdG9rZW4gPSBjZGsuU2VjcmV0VmFsdWUuc2VjcmV0c01hbmFnZXIoJ2NjZmlmZV9naXRodWInLCB7XG4gICAgICBqc29uRmllbGQ6ICdHaXRIdWInXG4gICAgfSk7XG5cbiAgICAvL2NyZWF0ZSBuZXcgY29kZXBpcGVsaW5lIEdpdEh1YiBTT1VSQ0Ugc3RhZ2VcbiAgICBjb25zdCBzb3VyY2VBY3Rpb24gPSBuZXcgcGlwZWxpbmVBY3Rpb24uR2l0SHViU291cmNlQWN0aW9uKHtcbiAgICAgIGFjdGlvbk5hbWU6ICdHaXRIdWJfU291cmNlJyxcbiAgICAgIG93bmVyOiAnY2NmaWZlJyxcbiAgICAgIHJlcG86ICdzdGF0aWN3ZWJzaXRlJyxcbiAgICAgIG91dHB1dDogc291cmNlT3V0cHV0LFxuICAgICAgb2F1dGhUb2tlbjogdG9rZW4sXG4gICAgfSk7XG5cbiAgICBwaXBlbGluZS5hZGRTdGFnZSh7XG4gICAgICBzdGFnZU5hbWU6ICdTb3VyY2UnLFxuICAgICAgYWN0aW9uczogW3NvdXJjZUFjdGlvbl1cbiAgICB9KVxuXG4gICAgLy9jcmVhdGUgYSBuZXcgY29kZXBpcGVsaW5lIERFUExPWSBzdGFnZVxuICAgIGNvbnN0IGRlcGxveUFjdGlvbiA9IG5ldyBwaXBlbGluZUFjdGlvbi5TM0RlcGxveUFjdGlvbih7XG4gICAgICBhY3Rpb25OYW1lOiAnUzNEZXBsb3knLFxuICAgICAgYnVja2V0OiBidWNrZXQsXG4gICAgICBpbnB1dDogc291cmNlT3V0cHV0LFxuICAgICAgZXh0cmFjdDogdHJ1ZSxcbiAgICB9KTtcblxuICAgIHBpcGVsaW5lLmFkZFN0YWdlKHtcbiAgICAgIHN0YWdlTmFtZTogJ0RlcGxveScsXG4gICAgICBhY3Rpb25zOiBbZGVwbG95QWN0aW9uXVxuICAgIH0pO1xuICAgICAgXG4gICAgLy9jcmVhdGUgQ2xvdWRGcm9udCBhY2Nlc3MgaWRlbnRpdHlcbiAgICBjb25zdCBvcmlnaW4gPSBuZXcgY2xvdWRmcm9udC5DZm5DbG91ZEZyb250T3JpZ2luQWNjZXNzSWRlbnRpdHkodGhpcywgJ0J1Y2tldE9yaWdpbicsIHtcbiAgICAgIGNsb3VkRnJvbnRPcmlnaW5BY2Nlc3NJZGVudGl0eUNvbmZpZzoge1xuICAgICAgICBjb21tZW50OiAnc29uYXIgbWFzdGVyJ1xuICAgICAgfVxuICAgIH0pO1xuXG5cbiAgICAvL2dyYW50IENsb3VkRnJvbnQgYWNjZXNzIGlkZW50aXR5IHVzZXJpZCBhY2Nlc3MgdG8gdGhlIHMzIGJ1Y2tldFxuICAgIGJ1Y2tldC5ncmFudFJlYWQobmV3IGlhbS5DYW5vbmljYWxVc2VyUHJpbmNpcGFsKFxuICAgICAgb3JpZ2luLmF0dHJTM0Nhbm9uaWNhbFVzZXJJZFxuICAgICkpO1xuXG4gICAgLy9jcmVhdGUgY2xvdWRmcm9udCBkaXN0cmlidXRpb25cbiAgICBjb25zdCBjZG4gPSBuZXcgY2xvdWRmcm9udC5DbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uKHRoaXMsICdjbG91ZGZyb250Jywge1xuICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuVmlld2VyUHJvdG9jb2xQb2xpY3kuQUxMT1dfQUxMLFxuICAgICAgcHJpY2VDbGFzczogY2xvdWRmcm9udC5QcmljZUNsYXNzLlBSSUNFX0NMQVNTX0FMTCxcbiAgICAgIG9yaWdpbkNvbmZpZ3M6IFtcbiAgICAgICAge1xuICAgICAgICAgIHMzT3JpZ2luU291cmNlOiB7XG4gICAgICAgICAgICBzM0J1Y2tldFNvdXJjZTogYnVja2V0LFxuICAgICAgICAgICAgb3JpZ2luQWNjZXNzSWRlbnRpdHlJZDogb3JpZ2luLnJlZlxuICAgICAgICAgIH0sXG4gICAgICAgICAgYmVoYXZpb3JzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGlzRGVmYXVsdEJlaGF2aW9yOiB0cnVlLFxuICAgICAgICAgICAgICBhbGxvd2VkTWV0aG9kczpcbiAgICAgICAgICAgICAgICBjbG91ZGZyb250LkNsb3VkRnJvbnRBbGxvd2VkTWV0aG9kcy5HRVRfSEVBRF9PUFRJT05TXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBvcmlnaW5QYXRoOiAnL3dlYi9zdGF0aWMnLFxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSlcblxuICAgIC8vb3V0cHV0IGNsb3VkZnJvbnQgVVJMXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Nsb3VkRnJvbnRVUkwnLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0NETiBVUkwnLFxuICAgICAgdmFsdWU6IFwiaHR0cHM6Ly9cIiArIGNkbi5kb21haW5OYW1lXG4gICAgfSlcbiAgICBcbiAgfVxufVxuIl19