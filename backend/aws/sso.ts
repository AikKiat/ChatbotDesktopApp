import {fromSSO} from "@aws-sdk/credential-provider-sso";

export async function getSSOCredentials(profile = "bedrock-sso"){
    const provider = fromSSO({profile : profile});

    const credentials = await provider();

    return {
        accessKeyId : credentials.accessKeyId,
        secretAccessKey : credentials.secretAccessKey,
        sessionToken : credentials.sessionToken,
        expiration : credentials.expiration
    };
}



