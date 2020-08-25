
import {expect as expectCDK, haveResource, haveResourceLike, SynthUtils} from '@monocdk-experiment/assert';
import {Stack, App} from 'monocdk-experiment';
//import '@aws-cdk/assert/jest';
import website = require('../lib/staticwebsite-stack');

test('static website infra has not changed', () => {
    const stack = new Stack();
    const site = new website.StaticwebsiteStack(stack, 'testwebsite');
    expect(SynthUtils.toCloudFormation(site)).toMatchSnapshot();
});


test('check S3 bucket website configuration', () => {
     const stack = new Stack();
     const site = new website.StaticwebsiteStack(stack, 'testwebsite');

     expectCDK(site).to(haveResource('AWS::S3::Bucket', {
         WebsiteConfiguration: {
            ErrorDocument: "404.html", 
            IndexDocument: "index.html"
         }
     }));
});

test('Check CloudFront origin path config', () => {
    const stack = new Stack();
    const site = new website.StaticwebsiteStack(stack, 'testwebsite');

    expectCDK(site).to(haveResourceLike('AWS::CloudFront::Distribution', {
        "DistributionConfig": {
            "DefaultRootObject": "index.html",
            "Origins": [
                {
                    "OriginPath": "/web/static"
                }
            ]
        }
    }));
});