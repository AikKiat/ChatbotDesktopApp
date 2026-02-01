
import { Message } from "../domain/message";
import { ModelDetails } from "../domain/model_details";

export class ModelsDetails{

    availableModels : ModelDetails = {}

    private static instance : ModelsDetails | null = null;

    private constructor(){

    }

    public static getInstance() : ModelsDetails{
        if(ModelsDetails.instance == null){
            ModelsDetails.instance = new ModelsDetails();
        }
        return ModelsDetails.instance;
    }

    public setAvailableModels(availableModels : ModelDetails){
        this.availableModels = availableModels;
    }

    public getAvailableModels(){
        return this.availableModels;
    }
}