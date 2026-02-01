

import { BedrockClient, ListFoundationModelsCommand } from "@aws-sdk/client-bedrock";
import { ModelDetails } from "../domain/model_details";
import { ModelsDetails } from "../persistence/models_details";

export async function listBedrockModels(credentials : any, region : string){
    const client = new BedrockClient({
        region : region,
        credentials : credentials
    });

    const result = await client.send(new ListFoundationModelsCommand({}));

    if(!result){
        console.error("Error fetching models via bedrock client");
    }

    let models = result.modelSummaries || []
    let availableModels : ModelDetails = {}
    let modelNames = []
    for (const model of models) {
        if (model.inferenceTypesSupported?.includes('ON_DEMAND')) {
            if(model.modelName && model.modelId){

                const model_info = {
                    'modelId': model.modelId,
                    'modelArn': model.modelArn,
                    'modelName': model.modelName,
                    'inferenceTypes': model.inferenceTypesSupported || []
                }

                modelNames.push(model.modelName);
                availableModels[model.modelName] = model_info;
            }
        }
    }
    console.log(availableModels);
    console.log(modelNames);
    ModelsDetails.getInstance().setAvailableModels(availableModels);

    return modelNames;
}