#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { PipelineStack } from '../lib/pipeline-stack'
import { StaticwebsiteStack } from '../lib/staticwebsite-stack';

const envUSA = { account: '033781032552', region: 'us-west-2'};
const envEU = { account: '033781032552', region: 'eu-west-1'};

const app = new cdk.App();
new PipelineStack(app, 'PipelineStack-us', {env: envUSA});
new StaticwebsiteStack(app, 'Static-Website-us', {env: envUSA});
new StaticwebsiteStack(app, 'Static-Website-eu', {env: envEU});

