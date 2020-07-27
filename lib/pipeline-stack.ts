import cdk = require('@aws-cdk/core');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import pipelineAction = require('@aws-cdk/aws-codepipeline-actions');
import cdkpipeline = require('@aws-cdk/pipelines');
import { SimpleSynthAction } from '@aws-cdk/pipelines';


export class PipelineStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

    //read the GitHub access key from SecretValue using the 'GitHub' name/value pair
    const token = cdk.SecretValue.secretsManager('ccfife_github', {
        jsonField: 'GitHub'
    });

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    //create a CDK Pipeline to deploy the static website

    const pipeline = new cdkpipeline.CdkPipeline(this, 'Pipeline', {
        pipelineName: 'NewSonarMasterPipeline',
        cloudAssemblyArtifact,

        sourceAction: new pipelineAction.GitHubSourceAction({
            actionName: 'GitHub_Source',
            owner: 'ccfife',
            repo: 'staticwebsite',
            output: sourceArtifact,
            oauthToken: token,
        }), 

        synthAction: SimpleSynthAction.standardNpmSynth({
            sourceArtifact,
            cloudAssemblyArtifact,
            buildCommand: 'npm run build'
        }),
    });
  }
}