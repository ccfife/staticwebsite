import {SynthUtils} from '@aws-cdk/assert';
import {Stack, App} from '@aws-cdk/core';
import '@aws-cdk/assert/jest';

import website = require('../lib/staticwebsite-stack');
import { tsIndexSignature } from '@babel/types';

test('static website infra has not changed', () => {
    const app = new App();
    const site = new website.StaticwebsiteStack(app, 'testwebsite');
    expect(SynthUtils.toCloudFormation(site)).toMatchSnapshot();

});

test('check S3 bucket website configuration', () => {
     const app = new App();
     const site = new website.StaticwebsiteStack(app, 'testwebsite');

     expect(site).toHaveResource('AWS::S3::Bucket', {
         WebsiteConfiguration: {
            ErrorDocument: "404.html", 
            IndexDocument: "index.html"
         }
     });
});

test('Check CloudFront origin path config', () => {
    const app = new App();
    const site = new website.StaticwebsiteStack(app, 'testwebsite');

    expect(site).toHaveResourceLike('AWS::CloudFront::Distribution', {
        "DistributionConfig": {
            "DefaultRootObject": "index.html",
            "Origins": [
                {
                    "OriginPath": "/web/static"
                }
            ]
        }
    });
});