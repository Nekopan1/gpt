import argparse
import json
from pathlib import Path

from .ai import Selara
from .config import SelaraConfig
from .conversation import ConversationManager
from .memory import InteractionMemory


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Chat locally with Selara.")
    parser.add_argument(
        "--model-name",
        default="gpt2",
        help="A Hugging Face model name or local path (e.g., 'gpt2' or './models/selara').",
    )
    parser.add_argument(
        "--max-new-tokens",
        type=int,
        default=200,
        help="Maximum tokens Selara will generate for each reply.",
    )
    parser.add_argument(
        "--temperature",
        type=float,
        default=0.7,
        help="Sampling temperature (0 for deterministic).",
    )
    parser.add_argument(
        "--device",
        default=None,
        help="Device for generation: cpu, cuda, or an int GPU id.",
    )
    parser.add_argument(
        "--system-prompt",
        default=None,
        help="Override Selara's default personality prompt.",
    )
    parser.add_argument(
        "--save-config",
        type=Path,
        default=None,
        help="Optional path to save the resolved configuration as JSON.",
    )
    parser.add_argument(
        "--memory-path",
        type=Path,
        default=None,
        help="Path to persist conversation memory for long-term improvement.",
    )
    parser.add_argument(
        "--memory-window",
        type=int,
        default=None,
        help="How many past exchanges to include as long-term memory context.",
    )
    parser.add_argument(
        "--disable-memory",
        action="store_true",
        help="Disable saving and loading persistent memory for this session.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    config = SelaraConfig(
        model_name=args.model_name,
        device=args.device,
        max_new_tokens=args.max_new_tokens,
        temperature=args.temperature,
        system_prompt=args.system_prompt or SelaraConfig.system_prompt,
        memory_path=args.memory_path or SelaraConfig().memory_path,
        memory_window=args.memory_window or SelaraConfig().memory_window,
        enable_memory=not args.disable_memory,
    )
    if args.save_config:
        args.save_config.write_text(json.dumps(config.__dict__, indent=2))

    print("Loading Selara... This may take a moment the first time a model is used.")
    selara = Selara(config)
    memory = None
    system_prompt = config.formatted_system_prompt()
    if config.enable_memory:
        memory = InteractionMemory(config.memory_path, window=config.memory_window)
        context = memory.context_prompt()
        if context:
            system_prompt = f"{system_prompt}\n\n{context}"

    conversation = ConversationManager(system_prompt)

    print("Selara is ready! Type 'exit' or 'quit' to stop.\n")
    while True:
        try:
            user_input = input("You: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nGoodbye!")
            break

        if user_input.lower() in {"exit", "quit"}:
            print("Goodbye!")
            break
        if not user_input:
            continue

        reply = selara.respond(conversation, user_input)
        print(f"Selara: {reply}\n")

        if memory is not None:
            memory.remember(user_input, reply)


if __name__ == "__main__":
    main()
