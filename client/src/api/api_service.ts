

/**
 * Electron IPC API Service
 * Replaces HTTP/WebSocket with Electron IPC for desktop app
 */

import type { AWSLoginResponse, ChatConvo, ChatData } from "./api_dtos";
import type { AIStreamChunk } from "./api_dtos";


let streamSubscribers: Array<(chunk: AIStreamChunk) => void> = [];
let isListenerInitialized = false;


export function initializeAIStreamListener() {
  // Only initialize once to prevent multiple IPC listeners
  if (isListenerInitialized) {
    return;
  }
  
  window.electronAPI.onStream((chunk) => {
    streamSubscribers.forEach((fn) => fn(chunk));
  });
  
  isListenerInitialized = true;
}


export function subscribeToAIStream(callback: (chunk: AIStreamChunk) => void) {
  streamSubscribers.push(callback);
}


export function unsubscribeFromAIStream(callback: (chunk: AIStreamChunk) => void) {
  streamSubscribers = streamSubscribers.filter((fn) => fn !== callback);
}


//send user input to ai, receive streaming response
export async function sendPromptToAI(userInput: string, chatId: number, offset : number, limit : number): Promise<void> {
  try {
    await window.electronAPI.sendPrompt(userInput, chatId, offset, limit);
  } catch (error: any) {
    console.error('Error sending prompt:', error);
    throw error;
  }
}

//fetch all chat titles
export async function fetchAllChatTitles(): Promise<ChatData[]> {
  try {
    const titlesMap = await window.electronAPI.getChatTitles();
    
    // Convert {id: title} to ChatData[]
    return Object.entries(titlesMap).map(([id, title]) => ({
      chat_id: parseInt(id),
      chat_title: title,
      messages: []
    }));
  } catch (error) {
    console.error('Failed to fetch chat titles:', error);
    throw new Error("Failed to retrieve all chat titles");
  }
}

//fetch chat conversations for a message id
export async function fetchChatConvoForGivenId(chatId: number): Promise<ChatConvo> {
  try {
    const messages = await window.electronAPI.getLatestMessages(chatId, 0, 10);
    const titlesMap = await window.electronAPI.getChatTitles();
    
    return {
      chat_title: titlesMap[chatId] || "New Chat",
      messages: messages.map(m => m),
      total_messages: messages.length
    };
  } catch (error) {
    console.error('Failed to fetch chat convo:', error);
    throw new Error("Failed to retrieve chat conversation");
  }
}

//store chat messages
export async function storeMessages(): Promise<void> {
  try {
    await window.electronAPI.storeMessages();
  } catch (error) {
    console.error('Failed to store messages:', error);
    throw error;
  }
}


//update chat title
export async function updateChatTitle(chatId: number, title: string): Promise<void> {
  try {
    const result = await window.electronAPI.updateChatTitle(chatId, title);
    if (result.error) {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Failed to update chat title:', error);
    throw error;
  }
}


//load more messages
export async function loadMoreMessages(chatId: number, offset: number, limit: number = 10): Promise<string[]> {
  try {
    const messages = await window.electronAPI.getLatestMessages(chatId, offset, limit);
    return messages.map(m =>m);
  } catch (error) {
    console.error('Error loading more messages:', error);
    return [];
  }
}

export async function awsLogin(){
  try{
    const result : AWSLoginResponse = await window.electronAPI.awsLogin();
    return result;
  } catch(error){
    console.error("Failed to login to aws");
  }
}

export async function awsListBedrockModels(){
  try{
    const result : any[] = await window.electronAPI.listModels();
    return result;
  } catch(error){
    console.error("Failed to list models from aws bedrock");
  }
}

export async function sendOverSessionConfigDetails(){
  try{
    const result = await window.electronAPI.awsConfigureSession();
    return result;
  } catch(error){
    console.error("Failed to send over session config details");
  }
}

export async function sendModelDetails(modelId : string){
  try{
    const result = await window.electronAPI.sendModelDetails(modelId);
    return result;
  } catch(error){
    console.error("Failed to send over model details");
  }
}