"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticwebsiteStack = void 0;
const cdk = require("@aws-cdk/core");
const s3 = require("@aws-cdk/aws-s3");
const s3deploy = require("@aws-cdk/aws-s3-deployment");
const cloudfront = require("@aws-cdk/aws-cloudfront");
class StaticwebsiteStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        //s3 bucket with support for website hosting
        const bucket = new s3.Bucket(this, 'staticWebsite_v1', {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: '404.html',
        });
        new s3deploy.BucketDeployment(this, 'DeployWebsite', {
            sources: [s3deploy.Source.asset('./web')],
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
                            allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS
                        }
                    ],
                    originPath: '/web/static',
                }
            ]
        });
        //output cloudfront URL
        this.UrlOutput = new cdk.CfnOutput(this, 'CloudFrontURL', {
            description: 'CDN URL',
            value: "https://" + cdn.domainName
        });
    }
}
exports.StaticwebsiteStack = StaticwebsiteStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljd2Vic2l0ZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXRpY3dlYnNpdGUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQXNDO0FBQ3RDLHNDQUF1QztBQUN2Qyx1REFBeUQ7QUFDekQsc0RBQXVEO0FBSXZELE1BQWEsa0JBQW1CLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFHL0MsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUNsRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw0Q0FBNEM7UUFDNUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBQyxrQkFBa0IsRUFBQztZQUNuRCxvQkFBb0IsRUFBRSxZQUFZO1lBQ2xDLG9CQUFvQixFQUFFLFVBQVU7U0FDakMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUNuRCxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QyxpQkFBaUIsRUFBRSxNQUFNO1lBQ3pCLG9CQUFvQixFQUFFLFlBQVk7U0FDbkMsQ0FBQyxDQUFDO1FBRUgsbUNBQW1DO1FBQ25DLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztRQUV6RSxpRUFBaUU7UUFDakUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV6QixnQ0FBZ0M7UUFDaEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUN2RSxvQkFBb0IsRUFBRSxVQUFVLENBQUMsb0JBQW9CLENBQUMsU0FBUztZQUMvRCxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxlQUFlO1lBQ2pELGFBQWEsRUFBRTtnQkFDYjtvQkFDRSxjQUFjLEVBQUU7d0JBQ2QsY0FBYyxFQUFFLE1BQU07d0JBQ3RCLG9CQUFvQixFQUFFLE1BQU07cUJBQzdCO29CQUNELFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxpQkFBaUIsRUFBRSxJQUFJOzRCQUN2QixjQUFjLEVBQ1osVUFBVSxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQjt5QkFDdkQ7cUJBQ0Y7b0JBQ0QsVUFBVSxFQUFFLGFBQWE7aUJBQzFCO2FBQ0Y7U0FDRixDQUFDLENBQUE7UUFFRix1QkFBdUI7UUFDdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUN4RCxXQUFXLEVBQUUsU0FBUztZQUN0QixLQUFLLEVBQUUsVUFBVSxHQUFHLEdBQUcsQ0FBQyxVQUFVO1NBQ25DLENBQUMsQ0FBQTtJQUVKLENBQUM7Q0FDRjtBQXJERCxnREFxREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2RrID0gcmVxdWlyZSgnQGF3cy1jZGsvY29yZScpO1xuaW1wb3J0IHMzID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLXMzJyk7XG5pbXBvcnQgczNkZXBsb3kgPSByZXF1aXJlICgnQGF3cy1jZGsvYXdzLXMzLWRlcGxveW1lbnQnKTtcbmltcG9ydCBjbG91ZGZyb250ID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWNsb3VkZnJvbnQnKTtcbmltcG9ydCB7IENmbk91dHB1dCB9IGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuXG5cbmV4cG9ydCBjbGFzcyBTdGF0aWN3ZWJzaXRlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBwdWJsaWMgcmVhZG9ubHkgVXJsT3V0cHV0OiBDZm5PdXRwdXRcblxuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy9zMyBidWNrZXQgd2l0aCBzdXBwb3J0IGZvciB3ZWJzaXRlIGhvc3RpbmdcbiAgICBjb25zdCBidWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsJ3N0YXRpY1dlYnNpdGVfdjEnLHtcbiAgICAgIHdlYnNpdGVJbmRleERvY3VtZW50OiAnaW5kZXguaHRtbCcsXG4gICAgICB3ZWJzaXRlRXJyb3JEb2N1bWVudDogJzQwNC5odG1sJyxcbiAgICB9KTtcblxuICAgIG5ldyBzM2RlcGxveS5CdWNrZXREZXBsb3ltZW50KHRoaXMsICdEZXBsb3lXZWJzaXRlJywge1xuICAgICAgc291cmNlczogW3MzZGVwbG95LlNvdXJjZS5hc3NldCgnLi93ZWInKV0sXG4gICAgICBkZXN0aW5hdGlvbkJ1Y2tldDogYnVja2V0LFxuICAgICAgZGVzdGluYXRpb25LZXlQcmVmaXg6ICd3ZWIvc3RhdGljJ1xuICAgIH0pO1xuICAgICAgXG4gICAgLy9jcmVhdGUgQ2xvdWRGcm9udCBhY2Nlc3MgaWRlbnRpdHlcbiAgICBjb25zdCBvcmlnaW4gPSBuZXcgY2xvdWRmcm9udC5PcmlnaW5BY2Nlc3NJZGVudGl0eSh0aGlzLCAnQnVja2V0T3JpZ2luJyk7XG5cbiAgICAvL2dyYW50IENsb3VkRnJvbnQgYWNjZXNzIGlkZW50aXR5IHVzZXJpZCBhY2Nlc3MgdG8gdGhlIHMzIGJ1Y2tldFxuICAgIGJ1Y2tldC5ncmFudFJlYWQob3JpZ2luKTtcblxuICAgIC8vY3JlYXRlIGNsb3VkZnJvbnQgZGlzdHJpYnV0aW9uXG4gICAgY29uc3QgY2RuID0gbmV3IGNsb3VkZnJvbnQuQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbih0aGlzLCAnY2xvdWRmcm9udCcsIHtcbiAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LkFMTE9XX0FMTCxcbiAgICAgIHByaWNlQ2xhc3M6IGNsb3VkZnJvbnQuUHJpY2VDbGFzcy5QUklDRV9DTEFTU19BTEwsXG4gICAgICBvcmlnaW5Db25maWdzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBzM09yaWdpblNvdXJjZToge1xuICAgICAgICAgICAgczNCdWNrZXRTb3VyY2U6IGJ1Y2tldCxcbiAgICAgICAgICAgIG9yaWdpbkFjY2Vzc0lkZW50aXR5OiBvcmlnaW4sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBiZWhhdmlvcnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaXNEZWZhdWx0QmVoYXZpb3I6IHRydWUsXG4gICAgICAgICAgICAgIGFsbG93ZWRNZXRob2RzOlxuICAgICAgICAgICAgICAgIGNsb3VkZnJvbnQuQ2xvdWRGcm9udEFsbG93ZWRNZXRob2RzLkdFVF9IRUFEX09QVElPTlNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIG9yaWdpblBhdGg6ICcvd2ViL3N0YXRpYycsXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KVxuXG4gICAgLy9vdXRwdXQgY2xvdWRmcm9udCBVUkxcbiAgICB0aGlzLlVybE91dHB1dCA9IG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdDbG91ZEZyb250VVJMJywge1xuICAgICAgZGVzY3JpcHRpb246ICdDRE4gVVJMJyxcbiAgICAgIHZhbHVlOiBcImh0dHBzOi8vXCIgKyBjZG4uZG9tYWluTmFtZVxuICAgIH0pXG4gICAgXG4gIH1cbn1cbiJdfQ==