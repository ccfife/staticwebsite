"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticwebsiteStack = void 0;
const cdk = require("@aws-cdk/core");
const s3 = require("@aws-cdk/aws-s3");
const cloudfront = require("@aws-cdk/aws-cloudfront");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljd2Vic2l0ZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXRpY3dlYnNpdGUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQXNDO0FBQ3RDLHNDQUF1QztBQUN2QyxzREFBdUQ7QUFFdkQsMERBQTJEO0FBQzNELG9FQUFxRTtBQUVyRSxNQUFhLGtCQUFtQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQy9DLFlBQVksS0FBb0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDbEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsNENBQTRDO1FBQzVDLE1BQU0sTUFBTSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUMsa0JBQWtCLEVBQUM7WUFDakQsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxvQkFBb0IsRUFBRSxVQUFVO1NBQ2pDLENBQUMsQ0FBQztRQUVMLDJFQUEyRTtRQUMzRSwwQ0FBMEM7UUFDMUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSwwQkFBMEIsRUFBRTtZQUMzRSxZQUFZLEVBQUUscUJBQXFCO1NBQ3BDLENBQUMsQ0FBQztRQUVILE1BQU0sWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWpELGdGQUFnRjtRQUNoRixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUU7WUFDNUQsU0FBUyxFQUFFLFFBQVE7U0FDcEIsQ0FBQyxDQUFDO1FBRUgsNkNBQTZDO1FBQzdDLE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxDQUFDLGtCQUFrQixDQUFDO1lBQ3pELFVBQVUsRUFBRSxlQUFlO1lBQzNCLEtBQUssRUFBRSxRQUFRO1lBQ2YsSUFBSSxFQUFFLGVBQWU7WUFDckIsTUFBTSxFQUFFLFlBQVk7WUFDcEIsVUFBVSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLFFBQVEsQ0FBQztZQUNoQixTQUFTLEVBQUUsUUFBUTtZQUNuQixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7U0FDeEIsQ0FBQyxDQUFBO1FBRUYsd0NBQXdDO1FBQ3hDLE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxDQUFDLGNBQWMsQ0FBQztZQUNyRCxVQUFVLEVBQUUsVUFBVTtZQUN0QixNQUFNLEVBQUUsTUFBTTtZQUNkLEtBQUssRUFBRSxZQUFZO1lBQ25CLE9BQU8sRUFBRSxJQUFJO1NBQ2QsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLFFBQVEsQ0FBQztZQUNoQixTQUFTLEVBQUUsUUFBUTtZQUNuQixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7U0FDeEIsQ0FBQyxDQUFDO1FBRUgsbUNBQW1DO1FBQ25DLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztRQUV6RSxpRUFBaUU7UUFDakUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV6QixnQ0FBZ0M7UUFDaEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUN2RSxvQkFBb0IsRUFBRSxVQUFVLENBQUMsb0JBQW9CLENBQUMsU0FBUztZQUMvRCxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxlQUFlO1lBQ2pELGFBQWEsRUFBRTtnQkFDYjtvQkFDRSxjQUFjLEVBQUU7d0JBQ2QsY0FBYyxFQUFFLE1BQU07d0JBQ3RCLG9CQUFvQixFQUFFLE1BQU07cUJBQzdCO29CQUNELFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxpQkFBaUIsRUFBRSxJQUFJOzRCQUN2QixjQUFjLEVBQ1osVUFBVSxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQjt5QkFDdkQ7cUJBQ0Y7b0JBQ0QsVUFBVSxFQUFFLGFBQWE7aUJBQzFCO2FBQ0Y7U0FDRixDQUFDLENBQUE7UUFFRix1QkFBdUI7UUFDdkIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdkMsV0FBVyxFQUFFLFNBQVM7WUFDdEIsS0FBSyxFQUFFLFVBQVUsR0FBRyxHQUFHLENBQUMsVUFBVTtTQUNuQyxDQUFDLENBQUE7SUFFSixDQUFDO0NBQ0Y7QUFyRkQsZ0RBcUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNkayA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2NvcmUnKTtcbmltcG9ydCBzMyA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1zMycpO1xuaW1wb3J0IGNsb3VkZnJvbnQgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtY2xvdWRmcm9udCcpO1xuaW1wb3J0IGlhbSA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2F3cy1pYW0nKTtcbmltcG9ydCBjb2RlcGlwZWxpbmUgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtY29kZXBpcGVsaW5lJyk7XG5pbXBvcnQgcGlwZWxpbmVBY3Rpb24gPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtY29kZXBpcGVsaW5lLWFjdGlvbnMnKTtcblxuZXhwb3J0IGNsYXNzIFN0YXRpY3dlYnNpdGVTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvL3MzIGJ1Y2tldCB3aXRoIHN1cHBvcnQgZm9yIHdlYnNpdGUgaG9zdGluZ1xuICAgIGNvbnN0IGJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywnc3RhdGljV2Vic2l0ZV92MScse1xuICAgICAgICB3ZWJzaXRlSW5kZXhEb2N1bWVudDogJ2luZGV4Lmh0bWwnLFxuICAgICAgICB3ZWJzaXRlRXJyb3JEb2N1bWVudDogJzQwNC5odG1sJyxcbiAgICAgIH0pO1xuXG4gICAgLy9jcmVhdGUgQ29kZVBpcGVsaW5lIHN0YWdlcyB0byBkZXBsb3kgdGhlIHN0YXRpYyB3ZWJzaXRlIGZyb20gR2l0SHViIHRvIFMzXG4gICAgLy9jcmVhdGUgdGhlIENvZGVQaXBlbGluZSBzZXJ2aWNlIGluc3RhbmNlXG4gICAgY29uc3QgcGlwZWxpbmUgPSBuZXcgY29kZXBpcGVsaW5lLlBpcGVsaW5lKHRoaXMsICdDREtTdGF0aWNXZWJzaXRlUGlwZWxpbmUnLCB7XG4gICAgICBwaXBlbGluZU5hbWU6ICdTb25hck1hc3RlclBpcGVsaW5lJ1xuICAgIH0pO1xuICAgIFxuICAgIGNvbnN0IHNvdXJjZU91dHB1dCA9IG5ldyBjb2RlcGlwZWxpbmUuQXJ0aWZhY3QoKTtcblxuICAgIC8vcmVhZCB0aGUgR2l0SHViIGFjY2VzcyBrZXkgZnJvbSBTZWNyZXRWYWx1ZSB1c2luZyB0aGUgJ0dpdEh1YicgbmFtZS92YWx1ZSBwYWlyXG4gICAgY29uc3QgdG9rZW4gPSBjZGsuU2VjcmV0VmFsdWUuc2VjcmV0c01hbmFnZXIoJ2NjZmlmZV9naXRodWInLCB7XG4gICAgICBqc29uRmllbGQ6ICdHaXRIdWInXG4gICAgfSk7XG5cbiAgICAvL2NyZWF0ZSBuZXcgY29kZXBpcGVsaW5lIEdpdEh1YiBTT1VSQ0Ugc3RhZ2VcbiAgICBjb25zdCBzb3VyY2VBY3Rpb24gPSBuZXcgcGlwZWxpbmVBY3Rpb24uR2l0SHViU291cmNlQWN0aW9uKHtcbiAgICAgIGFjdGlvbk5hbWU6ICdHaXRIdWJfU291cmNlJyxcbiAgICAgIG93bmVyOiAnY2NmaWZlJyxcbiAgICAgIHJlcG86ICdzdGF0aWN3ZWJzaXRlJyxcbiAgICAgIG91dHB1dDogc291cmNlT3V0cHV0LFxuICAgICAgb2F1dGhUb2tlbjogdG9rZW4sXG4gICAgfSk7XG5cbiAgICBwaXBlbGluZS5hZGRTdGFnZSh7XG4gICAgICBzdGFnZU5hbWU6ICdTb3VyY2UnLFxuICAgICAgYWN0aW9uczogW3NvdXJjZUFjdGlvbl1cbiAgICB9KVxuICAgIFxuICAgIC8vY3JlYXRlIGEgbmV3IGNvZGVwaXBlbGluZSBERVBMT1kgc3RhZ2VcbiAgICBjb25zdCBkZXBsb3lBY3Rpb24gPSBuZXcgcGlwZWxpbmVBY3Rpb24uUzNEZXBsb3lBY3Rpb24oe1xuICAgICAgYWN0aW9uTmFtZTogJ1MzRGVwbG95JyxcbiAgICAgIGJ1Y2tldDogYnVja2V0LFxuICAgICAgaW5wdXQ6IHNvdXJjZU91dHB1dCxcbiAgICAgIGV4dHJhY3Q6IHRydWUsXG4gICAgfSk7XG5cbiAgICBwaXBlbGluZS5hZGRTdGFnZSh7XG4gICAgICBzdGFnZU5hbWU6ICdEZXBsb3knLFxuICAgICAgYWN0aW9uczogW2RlcGxveUFjdGlvbl1cbiAgICB9KTtcbiAgICAgIFxuICAgIC8vY3JlYXRlIENsb3VkRnJvbnQgYWNjZXNzIGlkZW50aXR5XG4gICAgY29uc3Qgb3JpZ2luID0gbmV3IGNsb3VkZnJvbnQuT3JpZ2luQWNjZXNzSWRlbnRpdHkodGhpcywgJ0J1Y2tldE9yaWdpbicpO1xuXG4gICAgLy9ncmFudCBDbG91ZEZyb250IGFjY2VzcyBpZGVudGl0eSB1c2VyaWQgYWNjZXNzIHRvIHRoZSBzMyBidWNrZXRcbiAgICBidWNrZXQuZ3JhbnRSZWFkKG9yaWdpbik7XG5cbiAgICAvL2NyZWF0ZSBjbG91ZGZyb250IGRpc3RyaWJ1dGlvblxuICAgIGNvbnN0IGNkbiA9IG5ldyBjbG91ZGZyb250LkNsb3VkRnJvbnRXZWJEaXN0cmlidXRpb24odGhpcywgJ2Nsb3VkZnJvbnQnLCB7XG4gICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5BTExPV19BTEwsXG4gICAgICBwcmljZUNsYXNzOiBjbG91ZGZyb250LlByaWNlQ2xhc3MuUFJJQ0VfQ0xBU1NfQUxMLFxuICAgICAgb3JpZ2luQ29uZmlnczogW1xuICAgICAgICB7XG4gICAgICAgICAgczNPcmlnaW5Tb3VyY2U6IHtcbiAgICAgICAgICAgIHMzQnVja2V0U291cmNlOiBidWNrZXQsXG4gICAgICAgICAgICBvcmlnaW5BY2Nlc3NJZGVudGl0eTogb3JpZ2luLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYmVoYXZpb3JzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGlzRGVmYXVsdEJlaGF2aW9yOiB0cnVlLFxuICAgICAgICAgICAgICBhbGxvd2VkTWV0aG9kczpcbiAgICAgICAgICAgICAgICBjbG91ZGZyb250LkNsb3VkRnJvbnRBbGxvd2VkTWV0aG9kcy5HRVRfSEVBRF9PUFRJT05TXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBvcmlnaW5QYXRoOiAnL3dlYi9zdGF0aWMnLFxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSlcblxuICAgIC8vb3V0cHV0IGNsb3VkZnJvbnQgVVJMXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Nsb3VkRnJvbnRVUkwnLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0NETiBVUkwnLFxuICAgICAgdmFsdWU6IFwiaHR0cHM6Ly9cIiArIGNkbi5kb21haW5OYW1lXG4gICAgfSlcbiAgICBcbiAgfVxufVxuIl19