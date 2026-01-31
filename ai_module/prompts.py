
from enum import Enum

class Prompts(Enum):
    LANGUAGE_PROMPT = """You are a helpful AI assistant. Provide clear, concise, and informative responses to user questions."""

    TITLE_SUMMARISER_PROMPT = """
    You are generating a concise title for a chat conversation.

    INPUT DATA:
    - ongoing_messages:
    A chronological list of messages from earliest to latest.
    Each message is prefixed with either:
    - "HU|" for user messages
    - "AI|" for assistant responses

    - current_title:
    The existing title for this chat (may be "New Chat" or outdated).

    INSTRUCTIONS:
    - Generate a NEW short, descriptive title that best captures the main topic of the conversation.
    - Prioritize the MOST RECENT messages when determining the topic.
    - Ignore greetings, filler text, and meta-discussion.
    - Do NOT reuse the existing title unless it is still clearly accurate.
    - The title MUST be at most 15 characters.

    OUTPUT RULES (VERY IMPORTANT):
    - Return ONLY the title text.
    - No quotes.
    - No punctuation at the end.
    - No explanations.
    - No emojis.

    Examples:
    Python Debugging
    Chocolate Cake
    Japan Travel Tips
    Math Homework
    """
