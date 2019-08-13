"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("@aws-cdk/core");
const s3 = require("@aws-cdk/aws-s3");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljd2Vic2l0ZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXRpY3dlYnNpdGUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBc0M7QUFDdEMsc0NBQXVDO0FBQ3ZDLHNEQUF1RDtBQUN2RCx3Q0FBeUM7QUFDekMsMERBQTJEO0FBQzNELG9FQUFxRTtBQUVyRSxNQUFhLGtCQUFtQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQy9DLFlBQVksS0FBb0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDbEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsNENBQTRDO1FBQzVDLE1BQU0sTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUMsa0JBQWtCLEVBQUM7WUFDakQsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxvQkFBb0IsRUFBRSxVQUFVO1NBQ2pDLENBQUMsQ0FBQztRQUVMLDJFQUEyRTtRQUMzRSwwQ0FBMEM7UUFDMUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDOUQsWUFBWSxFQUFFLHFCQUFxQjtTQUNwQyxDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxJQUFJLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVqRCxnRkFBZ0Y7UUFDaEYsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFO1lBQzVELFNBQVMsRUFBRSxRQUFRO1NBQ3BCLENBQUMsQ0FBQztRQUVILDZDQUE2QztRQUM3QyxNQUFNLFlBQVksR0FBRyxJQUFJLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQztZQUN6RCxVQUFVLEVBQUUsZUFBZTtZQUMzQixLQUFLLEVBQUUsUUFBUTtZQUNmLElBQUksRUFBRSxlQUFlO1lBQ3JCLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLFVBQVUsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDaEIsU0FBUyxFQUFFLFFBQVE7WUFDbkIsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO1NBQ3hCLENBQUMsQ0FBQTtRQUVGLHdDQUF3QztRQUN4QyxNQUFNLFlBQVksR0FBRyxJQUFJLGNBQWMsQ0FBQyxjQUFjLENBQUM7WUFDckQsVUFBVSxFQUFFLFVBQVU7WUFDdEIsTUFBTSxFQUFFLE1BQU07WUFDZCxLQUFLLEVBQUUsWUFBWTtZQUNuQixPQUFPLEVBQUUsSUFBSTtTQUNkLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDaEIsU0FBUyxFQUFFLFFBQVE7WUFDbkIsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO1NBQ3hCLENBQUMsQ0FBQztRQUVILG1DQUFtQztRQUNuQyxNQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ3BGLG9DQUFvQyxFQUFFO2dCQUNwQyxPQUFPLEVBQUUsY0FBYzthQUN4QjtTQUNGLENBQUMsQ0FBQztRQUdILGlFQUFpRTtRQUNqRSxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxDQUFDLHNCQUFzQixDQUM3QyxNQUFNLENBQUMscUJBQXFCLENBQzdCLENBQUMsQ0FBQztRQUVILGdDQUFnQztRQUNoQyxNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3ZFLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTO1lBQy9ELFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLGVBQWU7WUFDakQsYUFBYSxFQUFFO2dCQUNiO29CQUNFLGNBQWMsRUFBRTt3QkFDZCxjQUFjLEVBQUUsTUFBTTt3QkFDdEIsc0JBQXNCLEVBQUUsTUFBTSxDQUFDLEdBQUc7cUJBQ25DO29CQUNELFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxpQkFBaUIsRUFBRSxJQUFJOzRCQUN2QixjQUFjLEVBQ1osVUFBVSxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQjt5QkFDdkQ7cUJBQ0Y7b0JBQ0QsVUFBVSxFQUFFLGFBQWE7aUJBQzFCO2FBQ0Y7U0FDRixDQUFDLENBQUE7UUFFRix1QkFBdUI7UUFDdkIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdkMsV0FBVyxFQUFFLFNBQVM7WUFDdEIsS0FBSyxFQUFFLFVBQVUsR0FBRyxHQUFHLENBQUMsVUFBVTtTQUNuQyxDQUFDLENBQUE7SUFFSixDQUFDO0NBQ0Y7QUE1RkQsZ0RBNEZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNkayA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2NvcmUnKTtcbmltcG9ydCBzMyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1zMycpO1xuaW1wb3J0IGNsb3VkZnJvbnQgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtY2xvdWRmcm9udCcpO1xuaW1wb3J0IGlhbSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1pYW0nKTtcbmltcG9ydCBjb2RlcGlwZWxpbmUgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtY29kZXBpcGVsaW5lJyk7XG5pbXBvcnQgcGlwZWxpbmVBY3Rpb24gPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtY29kZXBpcGVsaW5lLWFjdGlvbnMnKTtcblxuZXhwb3J0IGNsYXNzIFN0YXRpY3dlYnNpdGVTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvL3MzIGJ1Y2tldCB3aXRoIHN1cHBvcnQgZm9yIHdlYnNpdGUgaG9zdGluZ1xuICAgIGNvbnN0IGJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywnc3RhdGljV2Vic2l0ZV92MScse1xuICAgICAgICB3ZWJzaXRlSW5kZXhEb2N1bWVudDogJ2luZGV4Lmh0bWwnLFxuICAgICAgICB3ZWJzaXRlRXJyb3JEb2N1bWVudDogJzQwNC5odG1sJyxcbiAgICAgIH0pO1xuXG4gICAgLy9jcmVhdGUgQ29kZVBpcGVsaW5lIHN0YWdlcyB0byBkZXBsb3kgdGhlIHN0YXRpYyB3ZWJzaXRlIGZyb20gR2l0SHViIHRvIFMzXG4gICAgLy9jcmVhdGUgdGhlIENvZGVQaXBlbGluZSBzZXJ2aWNlIGluc3RhbmNlXG4gICAgY29uc3QgcGlwZWxpbmUgPSBuZXcgY29kZXBpcGVsaW5lLlBpcGVsaW5lKHRoaXMsICdDREtwaXBlbGluZScsIHtcbiAgICAgIHBpcGVsaW5lTmFtZTogJ1NvbmFyTWFzdGVyUGlwZWxpbmUnXG4gICAgfSk7XG4gICAgXG4gICAgY29uc3Qgc291cmNlT3V0cHV0ID0gbmV3IGNvZGVwaXBlbGluZS5BcnRpZmFjdCgpO1xuXG4gICAgLy9yZWFkIHRoZSBHaXRIdWIgYWNjZXNzIGtleSBmcm9tIFNlY3JldFZhbHVlIHVzaW5nIHRoZSAnR2l0SHViJyBuYW1lL3ZhbHVlIHBhaXJcbiAgICBjb25zdCB0b2tlbiA9IGNkay5TZWNyZXRWYWx1ZS5zZWNyZXRzTWFuYWdlcignY2NmaWZlX2dpdGh1YicsIHtcbiAgICAgIGpzb25GaWVsZDogJ0dpdEh1YidcbiAgICB9KTtcblxuICAgIC8vY3JlYXRlIG5ldyBjb2RlcGlwZWxpbmUgR2l0SHViIFNPVVJDRSBzdGFnZVxuICAgIGNvbnN0IHNvdXJjZUFjdGlvbiA9IG5ldyBwaXBlbGluZUFjdGlvbi5HaXRIdWJTb3VyY2VBY3Rpb24oe1xuICAgICAgYWN0aW9uTmFtZTogJ0dpdEh1Yl9Tb3VyY2UnLFxuICAgICAgb3duZXI6ICdjY2ZpZmUnLFxuICAgICAgcmVwbzogJ3N0YXRpY3dlYnNpdGUnLFxuICAgICAgb3V0cHV0OiBzb3VyY2VPdXRwdXQsXG4gICAgICBvYXV0aFRva2VuOiB0b2tlbixcbiAgICB9KTtcblxuICAgIHBpcGVsaW5lLmFkZFN0YWdlKHtcbiAgICAgIHN0YWdlTmFtZTogJ1NvdXJjZScsXG4gICAgICBhY3Rpb25zOiBbc291cmNlQWN0aW9uXVxuICAgIH0pXG5cbiAgICAvL2NyZWF0ZSBhIG5ldyBjb2RlcGlwZWxpbmUgREVQTE9ZIHN0YWdlXG4gICAgY29uc3QgZGVwbG95QWN0aW9uID0gbmV3IHBpcGVsaW5lQWN0aW9uLlMzRGVwbG95QWN0aW9uKHtcbiAgICAgIGFjdGlvbk5hbWU6ICdTM0RlcGxveScsXG4gICAgICBidWNrZXQ6IGJ1Y2tldCxcbiAgICAgIGlucHV0OiBzb3VyY2VPdXRwdXQsXG4gICAgICBleHRyYWN0OiB0cnVlLFxuICAgIH0pO1xuXG4gICAgcGlwZWxpbmUuYWRkU3RhZ2Uoe1xuICAgICAgc3RhZ2VOYW1lOiAnRGVwbG95JyxcbiAgICAgIGFjdGlvbnM6IFtkZXBsb3lBY3Rpb25dXG4gICAgfSk7XG4gICAgICBcbiAgICAvL2NyZWF0ZSBDbG91ZEZyb250IGFjY2VzcyBpZGVudGl0eVxuICAgIGNvbnN0IG9yaWdpbiA9IG5ldyBjbG91ZGZyb250LkNmbkNsb3VkRnJvbnRPcmlnaW5BY2Nlc3NJZGVudGl0eSh0aGlzLCAnQnVja2V0T3JpZ2luJywge1xuICAgICAgY2xvdWRGcm9udE9yaWdpbkFjY2Vzc0lkZW50aXR5Q29uZmlnOiB7XG4gICAgICAgIGNvbW1lbnQ6ICdzb25hciBtYXN0ZXInXG4gICAgICB9XG4gICAgfSk7XG5cblxuICAgIC8vZ3JhbnQgQ2xvdWRGcm9udCBhY2Nlc3MgaWRlbnRpdHkgdXNlcmlkIGFjY2VzcyB0byB0aGUgczMgYnVja2V0XG4gICAgYnVja2V0LmdyYW50UmVhZChuZXcgaWFtLkNhbm9uaWNhbFVzZXJQcmluY2lwYWwoXG4gICAgICBvcmlnaW4uYXR0clMzQ2Fub25pY2FsVXNlcklkXG4gICAgKSk7XG5cbiAgICAvL2NyZWF0ZSBjbG91ZGZyb250IGRpc3RyaWJ1dGlvblxuICAgIGNvbnN0IGNkbiA9IG5ldyBjbG91ZGZyb250LkNsb3VkRnJvbnRXZWJEaXN0cmlidXRpb24odGhpcywgJ2Nsb3VkZnJvbnQnLCB7XG4gICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5BTExPV19BTEwsXG4gICAgICBwcmljZUNsYXNzOiBjbG91ZGZyb250LlByaWNlQ2xhc3MuUFJJQ0VfQ0xBU1NfQUxMLFxuICAgICAgb3JpZ2luQ29uZmlnczogW1xuICAgICAgICB7XG4gICAgICAgICAgczNPcmlnaW5Tb3VyY2U6IHtcbiAgICAgICAgICAgIHMzQnVja2V0U291cmNlOiBidWNrZXQsXG4gICAgICAgICAgICBvcmlnaW5BY2Nlc3NJZGVudGl0eUlkOiBvcmlnaW4ucmVmXG4gICAgICAgICAgfSxcbiAgICAgICAgICBiZWhhdmlvcnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaXNEZWZhdWx0QmVoYXZpb3I6IHRydWUsXG4gICAgICAgICAgICAgIGFsbG93ZWRNZXRob2RzOlxuICAgICAgICAgICAgICAgIGNsb3VkZnJvbnQuQ2xvdWRGcm9udEFsbG93ZWRNZXRob2RzLkdFVF9IRUFEX09QVElPTlNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIG9yaWdpblBhdGg6ICcvd2ViL3N0YXRpYycsXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KVxuXG4gICAgLy9vdXRwdXQgY2xvdWRmcm9udCBVUkxcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQ2xvdWRGcm9udFVSTCcsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ0ROIFVSTCcsXG4gICAgICB2YWx1ZTogXCJodHRwczovL1wiICsgY2RuLmRvbWFpbk5hbWVcbiAgICB9KVxuICAgIFxuICB9XG59XG4iXX0=