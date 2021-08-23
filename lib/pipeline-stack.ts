import { SecretValue } from '@aws-cdk/core';
import cdk = require('@aws-cdk/core');
import {CodePipeline, CodePipelineSource, ShellStep} from '@aws-cdk/pipelines';
import { StaticWebsiteStage } from '../lib/staticwebsite-stage';

export class PipelineStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

        //read the GitHub access key from SecretValue using the 'GitHub' name/value pair
        const token = SecretValue.secretsManager('ccfife_github', {
            jsonField: 'GitHub'
        });
        //use the token to download the source from GitHub
        const source = CodePipelineSource.gitHub('ccfife/staticwebsite', 'master', {
            authentication: token
        });

        //define target environments for application 
        const envUSA = { account: '033781032552', region: 'us-west-2'};
        const envEU = { account: '033781032552', region: 'eu-west-1'};

        //create a CDK Pipeline to deploy the static website

        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'StaticWebsitePipeline',
            synth: new ShellStep('Synth', {
                input: source,
                commands: [
                    'npm ci',
                    'npm run build',
                    'npx cdk synth'
                ],
            }),
        });

        pipeline.addStage(new StaticWebsiteStage(this, 'USA', {
            env: envUSA
        }));

        //pipeline.addStage(new StaticWebsiteStage(this, 'EU', {
        //    env: envEU
        //}));


    }
}