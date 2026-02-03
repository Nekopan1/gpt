import argparse
import json
from pathlib import Path

import numpy as np
import torch
import yaml
from datasets import load_dataset
from transformers import (
    GPT2Config,
    GPT2LMHeadModel,
    PreTrainedTokenizerFast,
    Trainer,
    TrainingArguments,
    set_seed,
)


def load_config(path: Path) -> dict:
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def build_tokenizer(tokenizer_dir: Path) -> PreTrainedTokenizerFast:
    tokenizer = PreTrainedTokenizerFast(tokenizer_file=str(tokenizer_dir / "tokenizer.json"))
    tokenizer.add_special_tokens(
        {
            "pad_token": "<pad>",
            "unk_token": "<unk>",
            "bos_token": "<bos>",
            "eos_token": "<eos>",
            "mask_token": "<mask>",
        }
    )
    return tokenizer


def tokenize_batch(tokenizer, max_seq_len):
    def _inner(batch):
        tokens = tokenizer(
            batch["text"],
            truncation=True,
            max_length=max_seq_len,
            padding="max_length",
        )
        tokens["labels"] = tokens["input_ids"].copy()
        return tokens

    return _inner


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="training/config.yaml")
    args = parser.parse_args()

    config = load_config(Path(args.config))
    set_seed(config["seed"])

    dataset_path = Path(config["paths"]["dataset_path"])
    if not dataset_path.exists():
        fallback = dataset_path.parent / "data.json"
        if fallback.exists():
            dataset_path = fallback
        else:
            raise FileNotFoundError(
                f"Dataset not found at {dataset_path} or {fallback}. "
                "Update training/config.yaml or place your dataset file in data/."
            )
    tokenizer_dir = Path(config["paths"]["tokenizer_dir"])
    output_dir = Path(config["paths"]["output_dir"])

    if not tokenizer_dir.exists():
        raise FileNotFoundError(f"Tokenizer not found at {tokenizer_dir}. Run build_tokenizer.py first.")

    tokenizer = build_tokenizer(tokenizer_dir)

    data_files = {"train": str(dataset_path)}
    dataset = load_dataset("json", data_files=data_files, split="train")

    max_seq_len = config["training"]["max_seq_len"]
    tokenized = dataset.map(
        tokenize_batch(tokenizer, max_seq_len),
        batched=True,
        remove_columns=dataset.column_names,
    )

    model_config = GPT2Config(
        vocab_size=config["model"]["vocab_size"],
        n_positions=config["model"]["max_position_embeddings"],
        n_ctx=config["model"]["max_position_embeddings"],
        n_embd=config["model"]["n_embd"],
        n_layer=config["model"]["n_layer"],
        n_head=config["model"]["n_head"],
        resid_pdrop=config["model"]["resid_pdrop"],
        embd_pdrop=config["model"]["embd_pdrop"],
        attn_pdrop=config["model"]["attn_pdrop"],
    )

    model = GPT2LMHeadModel(model_config)
    model.resize_token_embeddings(len(tokenizer))

    training_args = TrainingArguments(
        output_dir=str(output_dir),
        per_device_train_batch_size=config["training"]["per_device_train_batch_size"],
        gradient_accumulation_steps=config["training"]["gradient_accumulation_steps"],
        num_train_epochs=config["training"]["num_train_epochs"],
        learning_rate=config["training"]["learning_rate"],
        weight_decay=config["training"]["weight_decay"],
        warmup_steps=config["training"]["warmup_steps"],
        logging_steps=config["training"]["logging_steps"],
        save_steps=config["training"]["save_steps"],
        fp16=config["training"]["fp16"],
        gradient_checkpointing=config["training"]["gradient_checkpointing"],
        optim="adamw_torch",
        report_to=[],
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized,
    )

    trainer.train()
    trainer.save_model(str(output_dir))
    tokenizer.save_pretrained(str(output_dir / "tokenizer"))


if __name__ == "__main__":
    main()
