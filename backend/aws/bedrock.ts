

import { BedrockClient, ListFoundationModelsCommand } from "@aws-sdk/client-bedrock";

export async function listBedrockModels(credentials : any, region : string){
    const client = new BedrockClient({
        region : region,
        credentials : credentials
    });

    const result = await client.send(new ListFoundationModelsCommand({}));

    if(!result){
        console.error("Error fetching models via bedrock client");
    }
    if(result.modelSummaries == undefined){
        console.error("Error fetching model summaries via bedrock client");
    }
    return result.modelSummaries;
}