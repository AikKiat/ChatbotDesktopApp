

export interface ModelDetails{
    [modelName : string] : Details
}

interface Details{
    modelId: string| undefined,
    modelArn: string | undefined,
    modelName: string | undefined,
    inferenceTypes: string[]
}