import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  awsListBedrockModels,
  awsLogin,
  sendOverSessionConfigDetails,
  sendModelDetails
} from "../../api/api_service";

import type { AWSLoginResponse } from "../../api/api_dtos";

export default function Login() {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const navigate = useNavigate();

  async function connectAws() {
    const result: AWSLoginResponse | undefined = await awsLogin();
    if (!result) {
      console.error("Failed to login");
      return;
    }

    console.log("Login successful");


    const models = await awsListBedrockModels();
    if (models) {
      console.log(models);
      setModels(models);
    }

    const sessionOk = await sendOverSessionConfigDetails();
    if (!sessionOk) {
      console.error("Failed to send session details");
      return;
    }

  }

  function continueToChatbot() {
    if (!selectedModel) {
      alert("Please select a model");
      return;
    }

    navigate("/chatbot");
  }

  async function setModel(modelId : string){
    setSelectedModel(modelId);
    await sendModelDetails(modelId);
  }

  return (
    <div>
      <button onClick={connectAws}>Connect AWS</button>

      <select
        onChange={(e) => setModel(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>
          Select a model
        </option>

        {models.map((modelName) => (
          <option key={modelName} value={modelName}>
            {modelName}
          </option>
        ))}
      </select>

      <button
        onClick={continueToChatbot}
        disabled={!selectedModel}
      >
        Continue
      </button>
    </div>
  );
}
