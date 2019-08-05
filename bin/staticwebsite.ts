#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { StaticwebsiteStack } from '../lib/staticwebsite-stack';

const app = new cdk.App();
new StaticwebsiteStack(app, 'StaticwebsiteStack');
