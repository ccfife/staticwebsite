"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticwebsiteStack = void 0;
const cdk = require("@aws-cdk/core");
const s3 = require("@aws-cdk/aws-s3");
const cloudfront = require("@aws-cdk/aws-cloudfront");
class StaticwebsiteStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        //s3 bucket with support for website hosting
        const bucket = new s3.Bucket(this, 'staticWebsite_v1', {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: '404.html',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljd2Vic2l0ZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXRpY3dlYnNpdGUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQXNDO0FBQ3RDLHNDQUF1QztBQUN2QyxzREFBdUQ7QUFLdkQsTUFBYSxrQkFBbUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUcvQyxZQUFZLEtBQW9CLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQ2xFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLDRDQUE0QztRQUM1QyxNQUFNLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFDLGtCQUFrQixFQUFDO1lBQ25ELG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsb0JBQW9CLEVBQUUsVUFBVTtTQUNqQyxDQUFDLENBQUM7UUFFSCxtQ0FBbUM7UUFDbkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRXpFLGlFQUFpRTtRQUNqRSxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXpCLGdDQUFnQztRQUNoQyxNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3ZFLG9CQUFvQixFQUFFLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTO1lBQy9ELFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLGVBQWU7WUFDakQsYUFBYSxFQUFFO2dCQUNiO29CQUNFLGNBQWMsRUFBRTt3QkFDZCxjQUFjLEVBQUUsTUFBTTt3QkFDdEIsb0JBQW9CLEVBQUUsTUFBTTtxQkFDN0I7b0JBQ0QsU0FBUyxFQUFFO3dCQUNUOzRCQUNFLGlCQUFpQixFQUFFLElBQUk7NEJBQ3ZCLGNBQWMsRUFDWixVQUFVLENBQUMsd0JBQXdCLENBQUMsZ0JBQWdCO3lCQUN2RDtxQkFDRjtvQkFDRCxVQUFVLEVBQUUsYUFBYTtpQkFDMUI7YUFDRjtTQUNGLENBQUMsQ0FBQTtRQUVGLHVCQUF1QjtRQUN2QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ3hELFdBQVcsRUFBRSxTQUFTO1lBQ3RCLEtBQUssRUFBRSxVQUFVLEdBQUcsR0FBRyxDQUFDLFVBQVU7U0FDbkMsQ0FBQyxDQUFBO0lBRUosQ0FBQztDQUNGO0FBL0NELGdEQStDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjZGsgPSByZXF1aXJlKCdAYXdzLWNkay9jb3JlJyk7XG5pbXBvcnQgczMgPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtczMnKTtcbmltcG9ydCBjbG91ZGZyb250ID0gcmVxdWlyZSgnQGF3cy1jZGsvYXdzLWNsb3VkZnJvbnQnKTtcbmltcG9ydCBpYW0gPSByZXF1aXJlKCdAYXdzLWNkay9hd3MtaWFtJyk7XG5pbXBvcnQgeyBDZm5PdXRwdXQgfSBmcm9tICdAYXdzLWNkay9jb3JlJztcblxuXG5leHBvcnQgY2xhc3MgU3RhdGljd2Vic2l0ZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IFVybE91dHB1dDogQ2ZuT3V0cHV0XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5Db25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vczMgYnVja2V0IHdpdGggc3VwcG9ydCBmb3Igd2Vic2l0ZSBob3N0aW5nXG4gICAgY29uc3QgYnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCdzdGF0aWNXZWJzaXRlX3YxJyx7XG4gICAgICB3ZWJzaXRlSW5kZXhEb2N1bWVudDogJ2luZGV4Lmh0bWwnLFxuICAgICAgd2Vic2l0ZUVycm9yRG9jdW1lbnQ6ICc0MDQuaHRtbCcsXG4gICAgfSk7XG4gICAgICBcbiAgICAvL2NyZWF0ZSBDbG91ZEZyb250IGFjY2VzcyBpZGVudGl0eVxuICAgIGNvbnN0IG9yaWdpbiA9IG5ldyBjbG91ZGZyb250Lk9yaWdpbkFjY2Vzc0lkZW50aXR5KHRoaXMsICdCdWNrZXRPcmlnaW4nKTtcblxuICAgIC8vZ3JhbnQgQ2xvdWRGcm9udCBhY2Nlc3MgaWRlbnRpdHkgdXNlcmlkIGFjY2VzcyB0byB0aGUgczMgYnVja2V0XG4gICAgYnVja2V0LmdyYW50UmVhZChvcmlnaW4pO1xuXG4gICAgLy9jcmVhdGUgY2xvdWRmcm9udCBkaXN0cmlidXRpb25cbiAgICBjb25zdCBjZG4gPSBuZXcgY2xvdWRmcm9udC5DbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uKHRoaXMsICdjbG91ZGZyb250Jywge1xuICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuVmlld2VyUHJvdG9jb2xQb2xpY3kuQUxMT1dfQUxMLFxuICAgICAgcHJpY2VDbGFzczogY2xvdWRmcm9udC5QcmljZUNsYXNzLlBSSUNFX0NMQVNTX0FMTCxcbiAgICAgIG9yaWdpbkNvbmZpZ3M6IFtcbiAgICAgICAge1xuICAgICAgICAgIHMzT3JpZ2luU291cmNlOiB7XG4gICAgICAgICAgICBzM0J1Y2tldFNvdXJjZTogYnVja2V0LFxuICAgICAgICAgICAgb3JpZ2luQWNjZXNzSWRlbnRpdHk6IG9yaWdpbixcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJlaGF2aW9yczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpc0RlZmF1bHRCZWhhdmlvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgYWxsb3dlZE1ldGhvZHM6XG4gICAgICAgICAgICAgICAgY2xvdWRmcm9udC5DbG91ZEZyb250QWxsb3dlZE1ldGhvZHMuR0VUX0hFQURfT1BUSU9OU1xuICAgICAgICAgICAgfVxuICAgICAgICAgIF0sXG4gICAgICAgICAgb3JpZ2luUGF0aDogJy93ZWIvc3RhdGljJyxcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pXG5cbiAgICAvL291dHB1dCBjbG91ZGZyb250IFVSTFxuICAgIHRoaXMuVXJsT3V0cHV0ID0gbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Nsb3VkRnJvbnRVUkwnLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0NETiBVUkwnLFxuICAgICAgdmFsdWU6IFwiaHR0cHM6Ly9cIiArIGNkbi5kb21haW5OYW1lXG4gICAgfSlcbiAgICBcbiAgfVxufVxuIl19