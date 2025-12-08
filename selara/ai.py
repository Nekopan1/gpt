from __future__ import annotations

from dataclasses import asdict
from typing import Iterable, Optional

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

from .config import SelaraConfig
from .conversation import ConversationManager


class Selara:
    """A lightweight conversational helper that runs locally."""

    def __init__(self, config: Optional[SelaraConfig] = None) -> None:
        self.config = config or SelaraConfig()
        self._pipeline = self._load_pipeline()

    def _load_pipeline(self):
        device = self._resolve_device()
        dtype = torch.float16 if device != "cpu" else None

        tokenizer = AutoTokenizer.from_pretrained(self.config.model_name)
        model = AutoModelForCausalLM.from_pretrained(
            self.config.model_name,
            torch_dtype=dtype,
            device_map=None if device == "cpu" else {"": device},
        )
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token

        generator = pipeline(
            task="text-generation",
            model=model,
            tokenizer=tokenizer,
            device=device,
        )
        return generator

    def _resolve_device(self):
        if self.config.device is not None:
            return self.config.device
        if torch.cuda.is_available():
            return 0
        return "cpu"

    def respond(self, conversation: ConversationManager, user_input: str) -> str:
        conversation.add_user(user_input)
        prompt = conversation.build_prompt()

        outputs = self._pipeline(
            prompt,
            max_new_tokens=self.config.max_new_tokens,
            do_sample=self.config.temperature > 0,
            temperature=self.config.temperature,
            eos_token_id=self._stop_tokens(),
        )
        completion = outputs[0]["generated_text"][len(prompt) :]
        cleaned = self._trim_stop(completion)
        conversation.add_assistant(cleaned)
        return cleaned

    def describe(self) -> dict:
        return asdict(self.config)

    def _stop_tokens(self) -> list[int]:
        tokenizer = self._pipeline.tokenizer
        stop_token_ids = [
            tokenizer.convert_tokens_to_ids(tokenizer.tokenize(stop)[0])
            for stop in self.config.stop_words
            if tokenizer.tokenize(stop)
        ]
        # Ensure EOS is included for safety
        if tokenizer.eos_token_id is not None:
            stop_token_ids.append(tokenizer.eos_token_id)
        return stop_token_ids

    def _trim_stop(self, text: str) -> str:
        for stop in self.config.stop_words:
            if stop in text:
                text = text.split(stop)[0]
        return text.strip()


__all__ = ["Selara"]
