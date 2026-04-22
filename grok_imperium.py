import os
import sys
import subprocess
import time
from typing import Optional
import typer
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt
from rich.layout import Layout
from rich.live import Live
from rich.text import Text
from rich.markdown import Markdown
from rich.syntax import Syntax
from dotenv import load_dotenv
from openai import OpenAI

# --- Configuration & Setup ---
load_dotenv()
API_KEY = os.getenv("XAI_API_KEY")

if not API_KEY:
    print("CRITICAL ERROR: XAI_API_KEY not found in .env file.")
    sys.exit(1)

client = OpenAI(
    api_key=API_KEY,
    base_url="https://api.x.ai/v1",
)

console = Console()
app = typer.Typer()

# --- Empire UI Constants ---
EMPIRE_RED = "bold red"
EMPIRE_GOLD = "bold gold1"
EMPIRE_BLUE = "bold cyan"
SYSTEM_STYLE = "dim white"

# --- Helper Functions ---

def boot_sequence():
    """Initiates the Empire Boot Sequence."""
    console.clear()
    steps = [
        "Initializing Neural Link...",
        "Connecting to xAI Mainframe...",
        "Loading Empire Protocols...",
        "Authenticating User: COMMANDER...",
        "GROK IMPERIUM ONLINE."
    ]
    
    with Live(Panel("Booting...", title="SYSTEM START", border_style=EMPIRE_RED), refresh_per_second=10) as live:
        for i, step in enumerate(steps):
            time.sleep(0.4)
            live.update(Panel("\n".join(steps[:i+1]), title="SYSTEM START", border_style=EMPIRE_RED))
    
    time.sleep(0.5)
    console.clear()
    console.print(Panel(Text("WELCOME TO GROK IMPERIUM", justify="center", style=EMPIRE_GOLD), border_style=EMPIRE_RED))
    console.print(Text("The Empire is listening.", justify="center", style="dim"))
    console.print()

def stream_response(messages):
    """Streams response from Grok API."""
    try:
        completion = client.chat.completions.create(
            model="grok-beta",
            messages=messages,
            stream=True
        )
        
        response_text = ""
        with Live(Panel("...", title="Grok", border_style=EMPIRE_BLUE), refresh_per_second=15) as live:
            for chunk in completion:
                content = chunk.choices[0].delta.content
                if content:
                    response_text += content
                    live.update(Panel(Markdown(response_text), title="Grok", border_style=EMPIRE_BLUE))
        
        return response_text
    except Exception as e:
        console.print(f"[{EMPIRE_RED}]COMMUNICATION ERROR:[/{EMPIRE_RED}] {str(e)}")
        return None

def execute_shell(command):
    """Executes a shell command and returns output."""
    console.print(f"[{EMPIRE_GOLD}]EXECUTING ORDER:[/{EMPIRE_GOLD}] {command}")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.stdout:
            console.print(Panel(result.stdout, title="STDOUT", border_style="green"))
        if result.stderr:
            console.print(Panel(result.stderr, title="STDERR", border_style=EMPIRE_RED))
        return f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    except Exception as e:
        console.print(f"[{EMPIRE_RED}]EXECUTION FAILED:[/{EMPIRE_RED}] {str(e)}")
        return str(e)

# --- Main CLI ---

@app.command()
def start(
    system_prompt: str = "You are Grok Imperium, the AI Commander of the User's Digital Empire. You are helpful, authoritative, and concise. You have access to shell commands if the user asks."
):
    """Starts the Grok Imperium Interactive Session."""
    boot_sequence()
    
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    while True:
        try:
            user_input = Prompt.ask(f"[{EMPIRE_GOLD}]COMMANDER[/{EMPIRE_GOLD}]")
            
            if user_input.lower() in ["exit", "quit", "shutdown"]:
                console.print(f"[{EMPIRE_RED}]SHUTTING DOWN...[/{EMPIRE_RED}]")
                break
            
            if not user_input.strip():
                continue

            # Special Command Handling (The "OS" Feel)
            if user_input.startswith("!"):
                cmd = user_input[1:]
                output = execute_shell(cmd)
                messages.append({"role": "user", "content": f"I executed this shell command: '{cmd}'. Here is the output:\n{output}\nPlease analyze or confirm."})                # We continue to let Grok comment on the output
            else:
                messages.append({"role": "user", "content": user_input})
            
            response = stream_response(messages)
            if response:
                messages.append({"role": "assistant", "content": response})
                
        except KeyboardInterrupt:
            console.print(f"\n[{EMPIRE_RED}]INTERRUPT SIGNAL RECEIVED. RESUMING...[/{EMPIRE_RED}]")
            continue

if __name__ == "__main__":
    app()
