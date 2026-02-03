import argparse
from pathlib import Path

import numpy as np
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

from memory.memory_store import MemoryStore


def embed_text(text: str, tokenizer, model) -> np.ndarray:
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    hidden = outputs.last_hidden_state[:, 0, :].cpu().numpy()
    return hidden.squeeze(0)


def build_prompt(system_prompt: str, memories: list[str], recent: list[str], user_input: str) -> str:
    memory_block = "\n".join(memories)
    recent_block = "\n".join(recent)
    return (
        f"System: {system_prompt}\n"
        f"Memories:\n{memory_block}\n"
        f"Recent:\n{recent_block}\n"
        f"User: {user_input}\nAssistant:"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-dir", required=True)
    parser.add_argument("--memory-db", default="memory/db.sqlite")
    parser.add_argument("--session-id", default="default")
    parser.add_argument("--system-prompt", default="You are a helpful, offline assistant with persistent memory.")
    parser.add_argument("--max-new-tokens", type=int, default=256)
    args = parser.parse_args()

    model_dir = Path(args.model_dir)
    model = AutoModelForCausalLM.from_pretrained(model_dir)
    tokenizer = AutoTokenizer.from_pretrained(model_dir)

    memory_store = MemoryStore(Path(args.memory_db), embedding_dim=model.config.n_embd)

    print("Offline chat started. Type 'exit' to stop.")
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in {"exit", "quit"}:
            break

        message_id = memory_store.add_message(args.session_id, "user", user_input)
        query_vector = embed_text(user_input, tokenizer, model)
        memory_store.add_embedding(message_id, query_vector)

        memory_ids = memory_store.search(query_vector, top_k=5)
        memories = [f"{item.role.title()}: {item.content}" for item in memory_store.fetch_messages_by_id(memory_ids)]
        recent = [f"{item.role.title()}: {item.content}" for item in memory_store.recent_messages(args.session_id, limit=10)]

        prompt = build_prompt(args.system_prompt, memories, recent, user_input)
        inputs = tokenizer(prompt, return_tensors="pt")
        outputs = model.generate(
            **inputs,
            max_new_tokens=args.max_new_tokens,
            do_sample=True,
            temperature=0.8,
            top_p=0.95,
        )
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        response_text = response.split("Assistant:")[-1].strip()
        print(f"Assistant: {response_text}")

        response_id = memory_store.add_message(args.session_id, "assistant", response_text)
        response_vector = embed_text(response_text, tokenizer, model)
        memory_store.add_embedding(response_id, response_vector)


if __name__ == "__main__":
    main()
