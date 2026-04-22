import os
from xai_sdk import Client
from xai_sdk.chat import system, user

# Initialize the client with your API key
# Using the key form environment variable VERTEX_KEY as set in your .bashrc
api_key = os.getenv("VERTEX_KEY")
print(f"Loaded API Key from VERTEX_KEY: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

try:
    client = Client(api_key=api_key)

    # Create a chat session
    print("Connecting to Grok...")
    chat = client.chat.create(model="grok-beta")
    
    # Add messages
    chat.append(system("You are a helpful assistant."))
    chat.append(user("Hello, can you confirm you are active and working?"))

    # Get response
    print("Sending message...")
    response = chat.sample()
    
    # Get the assistant's reply
    print(f"Grok Reply: {response.content}")

except Exception as e:
    print(f"Error communicating with Grok: {e}")

