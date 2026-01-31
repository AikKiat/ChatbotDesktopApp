import { useState } from "react";
import { awsListBedrockModels, awsLogin, sendOverSessionConfigDetails } from "../../api/api_service";
import type { AWSLoginResponse } from "../../api/api_dtos";

export default function App() {
  const [models, setModels] = useState<any[]>([]);

  async function connectAws() {
    const result : AWSLoginResponse | undefined = await awsLogin();
    if(result){
        console.log("Login successful");

        const result : any = await sendOverSessionConfigDetails();
        if(result){
          console.log("Sent over session details to AI service");
        }
        else{
          console.error("Failed to send over session details to AI service");
          return;
        }
    }
    else{
      console.error("Failed to login");
      return;
    }
    
    const models : any[] | undefined = await awsListBedrockModels();
    if(models){
        setModels(models);
    }
  }

  return (
    <div>
      <button onClick={connectAws}>Connect AWS</button>

      <select>
        {models.map(m => (
          <option key={m.modelId} value={m.modelId}>
            {m.modelName}
          </option>
        ))}
      </select>
    </div>
  );
}
