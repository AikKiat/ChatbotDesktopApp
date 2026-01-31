import React, { useEffect, useState } from "react";
import "../styles/chatbot.css";

import chatbotAssetIcon from "../assets/chatbot.png";

import {
    sendPromptToAI,
    fetchAllChatTitles,
    fetchChatConvoForGivenId,
    storeMessages,
    updateChatTitle,
    loadMoreMessages,
    subscribeToAIStream,
    unsubscribeFromAIStream,
} from "../../api/api_service";

import FadeInText from "./fade_in_text";

import type { ChatConvo, ChatData, ChatDataMappings } from "../../api/api_dtos";
import type { AIStreamChunk } from "../../api/api_dtos";

export default function AIBotSection() {
    const [messages, setMessages] = useState<string[]>([]);

    const [inputValue, setInputValue] = useState("");

    const [internalThoughtsString, setInternalThoughts] = useState<string>("");
    const [isAiLoadingResponse, setIsAiLoadingResponse] = useState<boolean>(false);

    const [sideChatsPanelExpanded, setSideChatsPanelExpanded] = useState<boolean>(false);
    const [chatDataMappings, setChatDataMappings] = useState<ChatDataMappings>({});
    const [currentTitle, setCurrentTitle] = useState<string>("");
    const [currentId, setCurrentId] = useState<number>(0);

    // Track loaded message count per chat for "Load More" functionality
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState<Map<number, boolean>>(new Map());

    // AI streaming state
    const [currentAIResponse, setCurrentAIResponse] = useState<string>("");

    // Subscribe to AI stream on mount
    useEffect(() => {
        const handleStream = (chunk: AIStreamChunk) => {
            switch (chunk.type) {
                case 'thought':
                    setInternalThoughts(chunk.content || "");
                    setIsAiLoadingResponse(true);
                    break;

                case 'token':
                    setCurrentAIResponse(chunk.content || "");
                    setIsAiLoadingResponse(true);
                    break;

                case 'title':
                    if (chunk.content) {
                        setCurrentTitle(chunk.content);
                    }
                    break;

                case 'done':
                    if (currentAIResponse) {
                        setMessages((prev) => [...prev, "AI|" + currentAIResponse]);
                        setCurrentAIResponse("");
                    }
                    if (chunk.chat_title) {
                        setCurrentTitle(chunk.chat_title);
                    }
                    setIsAiLoadingResponse(false);
                    setInternalThoughts("");
                    break;

                case 'error':
                    console.error('[AI Stream Error]', chunk.content);
                    setIsAiLoadingResponse(false);
                    setInternalThoughts("");
                    break;
            }
        };

        subscribeToAIStream(handleStream);

        return () => {
            unsubscribeFromAIStream(handleStream);
        };
    }, [currentAIResponse]);

    useEffect(() => {
        if (currentId > 0 && currentTitle) {
            setChatDataMappings((prev) => ({
                ...prev,
                [currentId]: { 
                    chat_id: currentId, 
                    chat_title: currentTitle,
                    messages: prev[currentId]?.messages || []
                },
            }));
        }
    }, [currentTitle]);

    async function handleSubmit() {
        if (!inputValue) return;
        setMessages([...messages, "HU|" + inputValue]);
        setIsAiLoadingResponse(true);
        setCurrentAIResponse("");
        
        try {
            await sendPromptToAI(inputValue, currentId, 0, 10); 
            
            //We put zero over here for the offset because these last 2 argument parameters 
            // will only be used for the first user's message to the ai upon switching to this chat. 
            // So we always want to fetch the latest and 10 messages earlier. 
            // The rest of the functions which contain parameters for current offset must be using the actual offset, 
            // since it is about fetching the messages from storage and not AI related.

            setInputValue("");
        } catch (error) {
            console.error('Failed to send prompt:', error);
            setIsAiLoadingResponse(false);
        }
    }

    function handleExpandSidePanel(){
        setSideChatsPanelExpanded(!sideChatsPanelExpanded);
    }

    const handleKeyDown = (event : React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
            setInputValue("");
        }
    }

    async function fetchChatConvo(chatId : number){

        let result : ChatConvo = await fetchChatConvoForGivenId(chatId);
        console.log("result", JSON.stringify(result));
        const chatTitle : string = result.chat_title;
        setCurrentTitle(chatTitle);
        setCurrentId(chatId);
        const messages : string[] = result.messages;
        setMessages(messages);
        
        const totalMessages = result.total_messages || -1;
        console.log(totalMessages);
        setHasMoreMessages(prev => new Map(prev).set(chatId, messages.length < totalMessages));
    }
    
    async function handleLoadMore() {
        if (isLoadingMore || currentId === 0) return;
        
        const currentMessages = chatDataMappings[currentId]?.messages || [];
        const currentOffset = currentMessages.length;
        
        setIsLoadingMore(true);
        
        try {
            const olderMessages = await loadMoreMessages(currentId, currentOffset, 10);
            
            if (olderMessages.length > 0) {
                // Prepend older messages to the start (they're older, so go before current messages)
                const updatedMessages: string[] = [...olderMessages.reverse(), ...currentMessages];
                setChatDataMappings(prev => ({
                    ...prev,
                    [currentId]: {
                        chat_id: currentId,
                        chat_title: prev[currentId]?.chat_title || "New Chat",
                        messages: updatedMessages
                    }
                }));
                
                // If we got fewer than requested, no more messages
                if (olderMessages.length < 10) {
                    setHasMoreMessages(prev => new Map(prev).set(currentId, false));
                }
            } else {
                // No more messages available
                setHasMoreMessages(prev => new Map(prev).set(currentId, false));
            }
        } catch (error) {
            console.error("Failed to load more messages:", error);
        } finally {
            setIsLoadingMore(false);
        }
    }


    async function fetchChatTitles() {
        const result: ChatData[] = await fetchAllChatTitles();

        const newMappings: ChatDataMappings = {};
        result.forEach((chatData: ChatData) => {
            newMappings[chatData.chat_id] = {
                ...chatData,
                messages: chatData.messages || []
            };
        });

        setChatDataMappings(newMappings);

        if (result.length > 0) {
            const latestChat = result.reduce((max, current) =>
                current.chat_id > max.chat_id ? current : max
            );
            fetchChatConvo(latestChat.chat_id);
        }
    }

    async function saveChat() {
        // Save messages to DB
        if (messages.length > 0 && currentId > 0) {
            await storeMessages(currentId, messages);
            await updateChatTitle(currentId, currentTitle);
        }
    }

    async function createNewChat() {
        // Save current chat before creating new one
        await saveChat();
        setMessages([]);

        let maxChatId = 0;
        Object.values(chatDataMappings).forEach((chatData: ChatData) => {
            if (chatData.chat_id > maxChatId) {
                maxChatId = chatData.chat_id;
            }
        });

        const newChatId = maxChatId + 1;
        const newChatTitle = "New Chat";

        setCurrentId(newChatId);
        setCurrentTitle(newChatTitle);
        setInputValue("");

        const updatedMappings = {
            ...chatDataMappings,
            [newChatId]: { 
                chat_id: newChatId, 
                chat_title: newChatTitle,
                messages: []
            },
        };
        setChatDataMappings(updatedMappings);
    }

    // Load chat titles on mount
    useEffect(() => {
        fetchChatTitles();
    }, []);

    return (
        <div className="chatbot_section_fullpage">
            <ChatBot
                saveChat={saveChat}
                fetchChatConvo={fetchChatConvo}
                createNewChat={createNewChat}
                chatDataMappings={chatDataMappings}
                currentId={currentId}
                sideChatsPanelExpanded={sideChatsPanelExpanded}
                handleExpandSidePanel={handleExpandSidePanel}
                setInputValue={setInputValue}
                handleSubmit={handleSubmit}
                messages={messages}
                currentTitle={currentTitle}
                isAiLoadingResponse={isAiLoadingResponse}
                internalThoughtsString={internalThoughtsString}
                inputValue={inputValue}
                handleKeyDown={handleKeyDown}
                handleLoadMore={handleLoadMore}
                isLoadingMore={isLoadingMore}
                hasMoreMessages={hasMoreMessages}
            />
        </div>
    );
}




interface chatBotProps {
    saveChat: () => void;
    fetchChatConvo: (value: number) => void;
    createNewChat: () => void;
    chatDataMappings: ChatDataMappings;
    currentId: number;
    sideChatsPanelExpanded: boolean;
    handleExpandSidePanel: () => void;
    setInputValue: (value: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    messages: string[];
    currentTitle: string;
    isAiLoadingResponse: boolean;
    internalThoughtsString: string;
    inputValue: string;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    handleLoadMore: () => void;
    isLoadingMore: boolean;
    hasMoreMessages: Map<number, boolean>;
}

export function ChatBot({
    saveChat,
    fetchChatConvo,
    createNewChat,
    chatDataMappings,
    currentId,
    sideChatsPanelExpanded,
    handleExpandSidePanel,
    setInputValue,
    handleSubmit,
    messages,
    currentTitle,
    isAiLoadingResponse,
    internalThoughtsString,
    inputValue,
    handleKeyDown,
    handleLoadMore,
    isLoadingMore,
    hasMoreMessages,
}: chatBotProps) {
    return (
        <>
            <div className={`side_panel ${sideChatsPanelExpanded ? "expanded" : "hidden"}`}>
                {chatDataMappings &&
                    Object.entries(chatDataMappings).map(([, chatData]) => {
                        let title: string = chatData.chat_title;
                        let id: number = chatData.chat_id;
                        return (
                            <div
                                id="chat"
                                key={id}
                                onClick={() => {
                                    if (Number(id) === currentId) {
                                        return;
                                    }
                                    saveChat();
                                    fetchChatConvo(id);
                                }}
                            >
                                {title}
                            </div>
                        );
                    })}
                <button
                    onClick={() => {
                        saveChat();
                        createNewChat();
                    }}
                    id="add_new_chat_button"
                >
                    + New Chat
                </button>
            </div>


        <div className="chatbot_interface_holder">
                <div className="chatbot_header">
                    <div className={`side_panel_button ${sideChatsPanelExpanded? "shifted_left" : "normal"}`} onClick={handleExpandSidePanel}>
                        <span id="bar"></span>
                        <span id="bar"></span>
                        <span id="bar"></span>
                    </div>
                    <h3>{currentTitle || "AI Assistant"}</h3>
                </div>

                <div className="chat_layout">
                    { messages && messages.length > 0 ? (
                        <div className="chatting_holder">
                            <div className="chatting_scroll_view">
                                {currentId >= 0 && hasMoreMessages.get(currentId) === true && (
                                    <button 
                                        className="load_more_button" 
                                        onClick={handleLoadMore}
                                        disabled={isLoadingMore}
                                    >
                                        {isLoadingMore ? "Loading..." : "Load More Messages"}
                                    </button>
                                )}

                                {messages.map((message, index) => {
                                    const isHuman = message.startsWith("HU|");
                                    const content = message.substring(3); // Remove "HU|" or "AI|" prefix
                                    
                                    if (isHuman) {
                                        return (
                                            <div key={index} className="text_box_holder_human">
                                                {content}
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div key={index} className="text_box_holder_ai">
                                                <FadeInText text={content} delay={20} />
                                            </div>
                                        );
                                    }
                                })}

                                {/* {isAiLoadingResponse && currentAIResponse && (
                                    <div className="text_box_holder_ai">
                                        <FadeInText text={currentAIResponse} delay={20} />
                                    </div>
                                )}

                                {isAiLoadingResponse && !currentAIResponse && (
                                    <div className="text_box_holder_ai">
                                        <div className="typing_indicator">
                                            <span className="typing_dot"></span>
                                            <span className="typing_dot"></span>
                                            <span className="typing_dot"></span>
                                        </div>
                                    </div>
                                )} */}
                            </div>

                            <div className={`internal_thoughts ${isAiLoadingResponse ? "visible" : "hidden"}`}>
                                <span id="spinning_icon"></span>
                                {internalThoughtsString}
                            </div>
                        </div>
                    ) : (
                        <img src={chatbotAssetIcon} id="chatbot_icon" />
                    )}
                </div>
                <div className="user_input_area">
                    <textarea className="textbox" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type your message..." onKeyDown={handleKeyDown}/>
                    <button id="submit_button" onClick={handleSubmit}>Send</button>
                </div>
                    
            </div>
        </>
    )
}