import { CfnOutput, Construct, Stage, StageProps } from 'monocdk-experiment';
import { StaticwebsiteStack } from '../lib/staticwebsite-stack';

export class StaticWebsiteStage extends Stage {
    public readonly urlOutput: CfnOutput;

    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        const service = new StaticwebsiteStack(this, 'SonarMaster')

        this.urlOutput = service.UrlOutput;
    }
}