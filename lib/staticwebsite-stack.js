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
        //Create a manual approval step
        const approveAction = new pipelineAction.ManualApprovalAction({
            actionName: 'Approve'
        });
        pipeline.addStage({
            stageName: 'APPROVE',
            actions: [approveAction]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljd2Vic2l0ZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXRpY3dlYnNpdGUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBc0M7QUFDdEMsc0NBQXVDO0FBQ3ZDLHNEQUF1RDtBQUN2RCx3Q0FBeUM7QUFDekMsMERBQTJEO0FBQzNELG9FQUFxRTtBQUVyRSxNQUFhLGtCQUFtQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQy9DLFlBQVksS0FBb0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDbEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsNENBQTRDO1FBQzVDLE1BQU0sTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUMsa0JBQWtCLEVBQUM7WUFDakQsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxvQkFBb0IsRUFBRSxVQUFVO1NBQ2pDLENBQUMsQ0FBQztRQUVMLDJFQUEyRTtRQUMzRSwwQ0FBMEM7UUFDMUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDOUQsWUFBWSxFQUFFLHFCQUFxQjtTQUNwQyxDQUFDLENBQUM7UUFFSCxNQUFNLFlBQVksR0FBRyxJQUFJLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUVqRCxnRkFBZ0Y7UUFDaEYsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFO1lBQzVELFNBQVMsRUFBRSxRQUFRO1NBQ3BCLENBQUMsQ0FBQztRQUVILDZDQUE2QztRQUM3QyxNQUFNLFlBQVksR0FBRyxJQUFJLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQztZQUN6RCxVQUFVLEVBQUUsZUFBZTtZQUMzQixLQUFLLEVBQUUsUUFBUTtZQUNmLElBQUksRUFBRSxlQUFlO1lBQ3JCLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLFVBQVUsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDaEIsU0FBUyxFQUFFLFFBQVE7WUFDbkIsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO1NBQ3hCLENBQUMsQ0FBQTtRQUdGLCtCQUErQjtRQUMvQixNQUFNLGFBQWEsR0FBRyxJQUFJLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQztZQUM1RCxVQUFVLEVBQUUsU0FBUztTQUN0QixDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsUUFBUSxDQUFDO1lBQ2hCLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLE9BQU8sRUFBQyxDQUFDLGFBQWEsQ0FBQztTQUN4QixDQUFDLENBQUM7UUFFSCx3Q0FBd0M7UUFDeEMsTUFBTSxZQUFZLEdBQUcsSUFBSSxjQUFjLENBQUMsY0FBYyxDQUFDO1lBQ3JELFVBQVUsRUFBRSxVQUFVO1lBQ3RCLE1BQU0sRUFBRSxNQUFNO1lBQ2QsS0FBSyxFQUFFLFlBQVk7WUFDbkIsT0FBTyxFQUFFLElBQUk7U0FDZCxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsUUFBUSxDQUFDO1lBQ2hCLFNBQVMsRUFBRSxRQUFRO1lBQ25CLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQztTQUN4QixDQUFDLENBQUM7UUFFSCxtQ0FBbUM7UUFDbkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsaUNBQWlDLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUNwRixvQ0FBb0MsRUFBRTtnQkFDcEMsT0FBTyxFQUFFLGNBQWM7YUFDeEI7U0FDRixDQUFDLENBQUM7UUFHSCxpRUFBaUU7UUFDakUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxzQkFBc0IsQ0FDN0MsTUFBTSxDQUFDLHFCQUFxQixDQUM3QixDQUFDLENBQUM7UUFFSCxnQ0FBZ0M7UUFDaEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUN2RSxvQkFBb0IsRUFBRSxVQUFVLENBQUMsb0JBQW9CLENBQUMsU0FBUztZQUMvRCxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxlQUFlO1lBQ2pELGFBQWEsRUFBRTtnQkFDYjtvQkFDRSxjQUFjLEVBQUU7d0JBQ2QsY0FBYyxFQUFFLE1BQU07d0JBQ3RCLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxHQUFHO3FCQUNuQztvQkFDRCxTQUFTLEVBQUU7d0JBQ1Q7NEJBQ0UsaUJBQWlCLEVBQUUsSUFBSTs0QkFDdkIsY0FBYyxFQUNaLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxnQkFBZ0I7eUJBQ3ZEO3FCQUNGO29CQUNELFVBQVUsRUFBRSxhQUFhO2lCQUMxQjthQUNGO1NBQ0YsQ0FBQyxDQUFBO1FBRUYsdUJBQXVCO1FBQ3ZCLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ3ZDLFdBQVcsRUFBRSxTQUFTO1lBQ3RCLEtBQUssRUFBRSxVQUFVLEdBQUcsR0FBRyxDQUFDLFVBQVU7U0FDbkMsQ0FBQyxDQUFBO0lBRUosQ0FBQztDQUNGO0FBdkdELGdEQXVHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjZGsgPSByZXF1aXJlKCdAYXdzLWNkay9jb3JlJyk7XG5pbXBvcnQgczMgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtczMnKTtcbmltcG9ydCBjbG91ZGZyb250ID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWNsb3VkZnJvbnQnKTtcbmltcG9ydCBpYW0gPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtaWFtJyk7XG5pbXBvcnQgY29kZXBpcGVsaW5lID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWNvZGVwaXBlbGluZScpO1xuaW1wb3J0IHBpcGVsaW5lQWN0aW9uID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWNvZGVwaXBlbGluZS1hY3Rpb25zJyk7XG5cbmV4cG9ydCBjbGFzcyBTdGF0aWN3ZWJzaXRlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy9zMyBidWNrZXQgd2l0aCBzdXBwb3J0IGZvciB3ZWJzaXRlIGhvc3RpbmdcbiAgICBjb25zdCBidWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsJ3N0YXRpY1dlYnNpdGVfdjEnLHtcbiAgICAgICAgd2Vic2l0ZUluZGV4RG9jdW1lbnQ6ICdpbmRleC5odG1sJyxcbiAgICAgICAgd2Vic2l0ZUVycm9yRG9jdW1lbnQ6ICc0MDQuaHRtbCcsXG4gICAgICB9KTtcblxuICAgIC8vY3JlYXRlIENvZGVQaXBlbGluZSBzdGFnZXMgdG8gZGVwbG95IHRoZSBzdGF0aWMgd2Vic2l0ZSBmcm9tIEdpdEh1YiB0byBTM1xuICAgIC8vY3JlYXRlIHRoZSBDb2RlUGlwZWxpbmUgc2VydmljZSBpbnN0YW5jZVxuICAgIGNvbnN0IHBpcGVsaW5lID0gbmV3IGNvZGVwaXBlbGluZS5QaXBlbGluZSh0aGlzLCAnQ0RLcGlwZWxpbmUnLCB7XG4gICAgICBwaXBlbGluZU5hbWU6ICdTb25hck1hc3RlclBpcGVsaW5lJ1xuICAgIH0pO1xuICAgIFxuICAgIGNvbnN0IHNvdXJjZU91dHB1dCA9IG5ldyBjb2RlcGlwZWxpbmUuQXJ0aWZhY3QoKTtcblxuICAgIC8vcmVhZCB0aGUgR2l0SHViIGFjY2VzcyBrZXkgZnJvbSBTZWNyZXRWYWx1ZSB1c2luZyB0aGUgJ0dpdEh1YicgbmFtZS92YWx1ZSBwYWlyXG4gICAgY29uc3QgdG9rZW4gPSBjZGsuU2VjcmV0VmFsdWUuc2VjcmV0c01hbmFnZXIoJ2NjZmlmZV9naXRodWInLCB7XG4gICAgICBqc29uRmllbGQ6ICdHaXRIdWInXG4gICAgfSk7XG5cbiAgICAvL2NyZWF0ZSBuZXcgY29kZXBpcGVsaW5lIEdpdEh1YiBTT1VSQ0Ugc3RhZ2VcbiAgICBjb25zdCBzb3VyY2VBY3Rpb24gPSBuZXcgcGlwZWxpbmVBY3Rpb24uR2l0SHViU291cmNlQWN0aW9uKHtcbiAgICAgIGFjdGlvbk5hbWU6ICdHaXRIdWJfU291cmNlJyxcbiAgICAgIG93bmVyOiAnY2NmaWZlJyxcbiAgICAgIHJlcG86ICdzdGF0aWN3ZWJzaXRlJyxcbiAgICAgIG91dHB1dDogc291cmNlT3V0cHV0LFxuICAgICAgb2F1dGhUb2tlbjogdG9rZW4sXG4gICAgfSk7XG5cbiAgICBwaXBlbGluZS5hZGRTdGFnZSh7XG4gICAgICBzdGFnZU5hbWU6ICdTb3VyY2UnLFxuICAgICAgYWN0aW9uczogW3NvdXJjZUFjdGlvbl1cbiAgICB9KVxuXG4gICAgXG4gICAgLy9DcmVhdGUgYSBtYW51YWwgYXBwcm92YWwgc3RlcFxuICAgIGNvbnN0IGFwcHJvdmVBY3Rpb24gPSBuZXcgcGlwZWxpbmVBY3Rpb24uTWFudWFsQXBwcm92YWxBY3Rpb24oe1xuICAgICAgYWN0aW9uTmFtZTogJ0FwcHJvdmUnIFxuICAgIH0pO1xuXG4gICAgcGlwZWxpbmUuYWRkU3RhZ2Uoe1xuICAgICAgc3RhZ2VOYW1lOiAnQVBQUk9WRScsXG4gICAgICBhY3Rpb25zOlthcHByb3ZlQWN0aW9uXVxuICAgIH0pO1xuICAgIFxuICAgIC8vY3JlYXRlIGEgbmV3IGNvZGVwaXBlbGluZSBERVBMT1kgc3RhZ2VcbiAgICBjb25zdCBkZXBsb3lBY3Rpb24gPSBuZXcgcGlwZWxpbmVBY3Rpb24uUzNEZXBsb3lBY3Rpb24oe1xuICAgICAgYWN0aW9uTmFtZTogJ1MzRGVwbG95JyxcbiAgICAgIGJ1Y2tldDogYnVja2V0LFxuICAgICAgaW5wdXQ6IHNvdXJjZU91dHB1dCxcbiAgICAgIGV4dHJhY3Q6IHRydWUsXG4gICAgfSk7XG5cbiAgICBwaXBlbGluZS5hZGRTdGFnZSh7XG4gICAgICBzdGFnZU5hbWU6ICdEZXBsb3knLFxuICAgICAgYWN0aW9uczogW2RlcGxveUFjdGlvbl1cbiAgICB9KTtcbiAgICAgIFxuICAgIC8vY3JlYXRlIENsb3VkRnJvbnQgYWNjZXNzIGlkZW50aXR5XG4gICAgY29uc3Qgb3JpZ2luID0gbmV3IGNsb3VkZnJvbnQuQ2ZuQ2xvdWRGcm9udE9yaWdpbkFjY2Vzc0lkZW50aXR5KHRoaXMsICdCdWNrZXRPcmlnaW4nLCB7XG4gICAgICBjbG91ZEZyb250T3JpZ2luQWNjZXNzSWRlbnRpdHlDb25maWc6IHtcbiAgICAgICAgY29tbWVudDogJ3NvbmFyIG1hc3RlcidcbiAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgLy9ncmFudCBDbG91ZEZyb250IGFjY2VzcyBpZGVudGl0eSB1c2VyaWQgYWNjZXNzIHRvIHRoZSBzMyBidWNrZXRcbiAgICBidWNrZXQuZ3JhbnRSZWFkKG5ldyBpYW0uQ2Fub25pY2FsVXNlclByaW5jaXBhbChcbiAgICAgIG9yaWdpbi5hdHRyUzNDYW5vbmljYWxVc2VySWRcbiAgICApKTtcblxuICAgIC8vY3JlYXRlIGNsb3VkZnJvbnQgZGlzdHJpYnV0aW9uXG4gICAgY29uc3QgY2RuID0gbmV3IGNsb3VkZnJvbnQuQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbih0aGlzLCAnY2xvdWRmcm9udCcsIHtcbiAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LkFMTE9XX0FMTCxcbiAgICAgIHByaWNlQ2xhc3M6IGNsb3VkZnJvbnQuUHJpY2VDbGFzcy5QUklDRV9DTEFTU19BTEwsXG4gICAgICBvcmlnaW5Db25maWdzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBzM09yaWdpblNvdXJjZToge1xuICAgICAgICAgICAgczNCdWNrZXRTb3VyY2U6IGJ1Y2tldCxcbiAgICAgICAgICAgIG9yaWdpbkFjY2Vzc0lkZW50aXR5SWQ6IG9yaWdpbi5yZWZcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJlaGF2aW9yczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpc0RlZmF1bHRCZWhhdmlvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgYWxsb3dlZE1ldGhvZHM6XG4gICAgICAgICAgICAgICAgY2xvdWRmcm9udC5DbG91ZEZyb250QWxsb3dlZE1ldGhvZHMuR0VUX0hFQURfT1BUSU9OU1xuICAgICAgICAgICAgfVxuICAgICAgICAgIF0sXG4gICAgICAgICAgb3JpZ2luUGF0aDogJy93ZWIvc3RhdGljJyxcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pXG5cbiAgICAvL291dHB1dCBjbG91ZGZyb250IFVSTFxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdDbG91ZEZyb250VVJMJywge1xuICAgICAgZGVzY3JpcHRpb246ICdDRE4gVVJMJyxcbiAgICAgIHZhbHVlOiBcImh0dHBzOi8vXCIgKyBjZG4uZG9tYWluTmFtZVxuICAgIH0pXG4gICAgXG4gIH1cbn1cbiJdfQ==