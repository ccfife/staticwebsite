import monocdk = require('monocdk-experiment');
import { aws_codepipeline, pipelines, aws_codepipeline_actions } from 'monocdk-experiment';
import { StaticWebsiteStage } from '../lib/staticwebsite-stage';

export class PipelineStack extends monocdk.Stack {
    constructor(scope: monocdk.Construct, id: string, props?: monocdk.StackProps) {
      super(scope, id, props);

    //read the GitHub access key from SecretValue using the 'GitHub' name/value pair
    const token = monocdk.SecretValue.secretsManager('ccfife_github', {
        jsonField: 'GitHub'
    });

    const sourceArtifact = new aws_codepipeline.Artifact();
    const cloudAssemblyArtifact = new aws_codepipeline.Artifact();
    const integTestArtifact = new aws_codepipeline.Artifact();

    const envUSA = { account: '033781032552', region: 'us-west-2'};
    const envEU = { account: '033781032552', region: 'eu-west-1'};

    //create a CDK Pipeline to deploy the static website

    const pipeline = new pipelines.CdkPipeline(this, 'Pipeline', {
        pipelineName: 'NewSonarMasterPipeline',
        cloudAssemblyArtifact,

        sourceAction: new aws_codepipeline_actions.GitHubSourceAction({
            actionName: 'GitHub_Source',
            owner: 'ccfife',
            repo: 'staticwebsite',
            output: sourceArtifact,
            oauthToken: token,
            trigger: aws_codepipeline_actions.GitHubTrigger.WEBHOOK
        }), 

        synthAction: pipelines.SimpleSynthAction.standardNpmSynth({
            sourceArtifact,
            cloudAssemblyArtifact,
            buildCommand: 'npm run build',   
        }),
    });

    pipeline.addApplicationStage(new StaticWebsiteStage(this, 'DevStageStack', {
        env: envUSA 
    }));

    pipeline.addApplicationStage(new StaticWebsiteStage(this, 'TestStageStack', {
        env: envEU
    }));

  }
}