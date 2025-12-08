# Selara: Local Python AI

Selara is a fully local, Python-based conversational AI that you can run on your own PC. It ships with a simple CLI, uses Hugging Face models under the hood, and keeps all conversation context in memory. Customize the model, temperature, and personality to suit your hardware and style.

## Features
- Runs locally with Hugging Face `transformers` models (defaults to `gpt2` for quick start) and auto-uses GPU when available (tested on an RTX 3060 12GB, 32-core CPU, 64GB RAM setup).
- Command-line chat loop with graceful exit handling.
- Adjustable generation settings (temperature, max tokens, device selection).
- Configurable system prompt that defines Selara's personality.
- Conversation history management that formats prompts consistently.
- Optional long-term memory persisted to disk so Selara can improve over time as you interact.

## Quickstart
1. Install Python 3.10+ and optionally create a virtual environment. For CUDA acceleration on an RTX 3060, install a matching PyTorch build (for example: `pip install torch==2.2.0+cu118 --index-url https://download.pytorch.org/whl/cu118`).
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Chat with Selara using a local or downloaded model:
   ```bash
   python -m selara.cli --model-name gpt2
   ```
   For faster or offline use, point `--model-name` to a local model directory (for example, one you exported from Hugging Face):
   ```bash
   python -m selara.cli --model-name ./models/selara
   ```

## Configuration options
| Flag | Description | Default |
| --- | --- | --- |
| `--model-name` | Hugging Face model name or local path. | `gpt2` |
| `--max-new-tokens` | Maximum tokens Selara will generate per response. | `200` |
| `--temperature` | Sampling temperature (`0` for deterministic). | `0.7` |
| `--device` | Generation device (`cpu`, `cuda`, or GPU id). | `None` (auto) |
| `--system-prompt` | Override Selara's default personality prompt. | built-in |
| `--save-config` | Write resolved settings to a JSON file. | `None` |
| `--memory-path` | File path for persistent long-term memory. | `~/.selara/memory.jsonl` |
| `--memory-window` | Number of past exchanges to load into context. | `20` |
| `--disable-memory` | Skip loading/saving the long-term memory file. | `False` |

## Design
- `Selara` (in `selara/ai.py`) wraps a `transformers` text-generation pipeline, loads models to GPU automatically when possible, and handles stop sequences for cleaner replies.
- `ConversationManager` (in `selara/conversation.py`) keeps system, user, and assistant messages and builds a formatted prompt.
- `InteractionMemory` (in `selara/memory.py`) persists recent exchanges to `~/.selara/memory.jsonl` (configurable) and feeds them back into new sessions.
- `SelaraConfig` (in `selara/config.py`) stores tunable parameters and exposes a helper for the system prompt.
- `selara/cli.py` provides the interactive command-line experience.

## Long-term improvement
- Selara writes each exchange to a memory file (default `~/.selara/memory.jsonl`).
- At startup, the most recent entries (default: last 20) are appended to the system prompt so Selara can retain context and adapt to your preferences over time.
- To disable persistent memory for a session, pass `--disable-memory`. You can also point to a different path with `--memory-path` and adjust the window with `--memory-window`.

## Notes
- The first run of a given model will download weights if they are not already cached locally.
- For the best fully-offline experience, download a compatible causal language model and reference it via `--model-name` with a local path.
- You can swap in any causal LM supported by `transformers` (e.g., GPT-NeoX, LLaMA derivatives) as long as it fits your hardware constraints.
- An RTX 3060 12GB can comfortably run smaller GPT-style models (e.g., GPT-2/NeoX) in half precision. For larger models, consider quantized weights or CPU offload via `accelerate`.
