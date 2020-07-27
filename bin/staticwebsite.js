#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("@aws-cdk/core");
const pipeline_stack_1 = require("../lib/pipeline-stack");
const staticwebsite_stack_1 = require("../lib/staticwebsite-stack");
const envUSA = { account: '033781032552', region: 'us-west-2' };
const envEU = { account: '033781032552', region: 'eu-west-1' };
const app = new cdk.App();
new pipeline_stack_1.PipelineStack(app, 'PipelineStack-us', { env: envUSA });
new staticwebsite_stack_1.StaticwebsiteStack(app, 'Static-Website-us', { env: envUSA });
new staticwebsite_stack_1.StaticwebsiteStack(app, 'Static-Website-eu', { env: envEU });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljd2Vic2l0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXRpY3dlYnNpdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsdUNBQXFDO0FBQ3JDLHFDQUFzQztBQUN0QywwREFBcUQ7QUFDckQsb0VBQWdFO0FBRWhFLE1BQU0sTUFBTSxHQUFHLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFDL0QsTUFBTSxLQUFLLEdBQUcsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUMsQ0FBQztBQUU5RCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMxQixJQUFJLDhCQUFhLENBQUMsR0FBRyxFQUFFLGtCQUFrQixFQUFFLEVBQUMsR0FBRyxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7QUFDMUQsSUFBSSx3Q0FBa0IsQ0FBQyxHQUFHLEVBQUUsbUJBQW1CLEVBQUUsRUFBQyxHQUFHLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztBQUNoRSxJQUFJLHdDQUFrQixDQUFDLEdBQUcsRUFBRSxtQkFBbUIsRUFBRSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0ICdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInO1xuaW1wb3J0IGNkayA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2NvcmUnKTtcbmltcG9ydCB7IFBpcGVsaW5lU3RhY2sgfSBmcm9tICcuLi9saWIvcGlwZWxpbmUtc3RhY2snXG5pbXBvcnQgeyBTdGF0aWN3ZWJzaXRlU3RhY2sgfSBmcm9tICcuLi9saWIvc3RhdGljd2Vic2l0ZS1zdGFjayc7XG5cbmNvbnN0IGVudlVTQSA9IHsgYWNjb3VudDogJzAzMzc4MTAzMjU1MicsIHJlZ2lvbjogJ3VzLXdlc3QtMid9O1xuY29uc3QgZW52RVUgPSB7IGFjY291bnQ6ICcwMzM3ODEwMzI1NTInLCByZWdpb246ICdldS13ZXN0LTEnfTtcblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbm5ldyBQaXBlbGluZVN0YWNrKGFwcCwgJ1BpcGVsaW5lU3RhY2stdXMnLCB7ZW52OiBlbnZVU0F9KTtcbm5ldyBTdGF0aWN3ZWJzaXRlU3RhY2soYXBwLCAnU3RhdGljLVdlYnNpdGUtdXMnLCB7ZW52OiBlbnZVU0F9KTtcbm5ldyBTdGF0aWN3ZWJzaXRlU3RhY2soYXBwLCAnU3RhdGljLVdlYnNpdGUtZXUnLCB7ZW52OiBlbnZFVX0pO1xuXG4iXX0=