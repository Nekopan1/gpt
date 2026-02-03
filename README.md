# Self-Made AI (Train From Scratch) — Starter Blueprint

This document provides a **practical, hardware-aware baseline** for building and training your own language model from scratch, plus a **persistent memory** layer so the assistant can remember what you say over time. It includes a **minimal working project layout** with training, memory, and offline chat scripts.

> **Target hardware:** Ryzen 9950X, 64 GB RAM, RTX 5070 (12 GB VRAM)

---

## 1) Reality Check: What “Train From Scratch” Means
Training a general-purpose LLM from scratch is **expensive**. With 12 GB VRAM, you should focus on a **quality-first small model (300M–1.3B parameters)** and **optimize for stability**. You’ll still get a fully custom model, but it won’t match giant models without huge compute.

**Recommended starting sizes (quality-first):**
- **~1.3B params** if you want the highest quality possible on this GPU and can accept slow training.
- **~300M params** only if you need faster iteration.

---

## 2) High-Level Architecture
Your system should have three layers:

1. **Core Model** (trained from scratch)
2. **Memory Service** (persistent storage + retrieval)
3. **Chat Orchestrator** (stitches model + memory + prompt formatting)

```
[User] → [Chat Orchestrator]
              ↘
          [Memory Service]
              ↘
           [Core Model]
```

---

## 3) Persistent Memory (Long-Term Recall)
A model alone **does not remember** past chats unless you re-train or inject context. The most practical approach is **RAG-style memory** (retrieval-augmented generation), with **full conversation retention** so it never forgets what was said:

### Memory Components
- **Conversation log:** full raw messages stored in a database (no pruning).
- **Summaries:** periodic condensed summaries for faster recall (original text still preserved).
- **Embeddings index:** vector search to retrieve relevant memories.
- **Timeline cache:** optional chronological window (recent N messages) for exact context.

### Suggested Storage
- **SQLite** for message history + metadata.
- **Vector DB** (FAISS, SQLite + `sqlite-vss`, or Chroma) for semantic recall.

### Example Schema (SQLite)
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  session_id TEXT,
  role TEXT,
  content TEXT,
  created_at DATETIME
);

CREATE TABLE summaries (
  id INTEGER PRIMARY KEY,
  session_id TEXT,
  summary TEXT,
  created_at DATETIME
);
```

### Memory Retrieval Flow (No Forgetting)
1. **Store everything**: every message is written to the DB (no expiry).
2. Embed the user’s new message.
3. Query the vector index for related past messages/summaries.
4. Inject top-k semantic results + **recent chronological window** into the system prompt.
5. Periodically generate summaries to keep prompts compact (original raw text is still retained).

---

## 4) Training Pipeline (From Scratch)
### Key Steps
1. **Dataset selection/curation** (must be legally usable)
2. **Tokenizer training** (BPE/SentencePiece)
3. **Model config** (size, layers, heads)
4. **Pretraining** (self-supervised, next-token prediction)

### Recommended Stack (Most Advanced / Offline)
- **PyTorch 2.x** with `torch.compile`
- **FlashAttention 2** (or 3, if supported) for faster attention
- **DeepSpeed ZeRO-3** or **FSDP** for memory-efficient training
- **Hugging Face Transformers + Datasets** (offline cached)
- **Hugging Face Accelerate** for multi-GPU prep and config
- **SentencePiece** or **Tokenizer (HF)** with BPE
- **Weights & Biases** (optional, but can be disabled/offline)

### Practical VRAM Constraints (12 GB)
- Use **fp16/bf16** mixed precision.
- Enable **gradient checkpointing**.
- Keep batch sizes small, use **gradient accumulation**.

---

## 5) Quality-First Model Configuration (Example)
*(Adjust to your dataset and training time tolerance)*

- **Hidden size:** 2048
- **Layers:** 24
- **Heads:** 16
- **Parameters:** ~1.3B

---

## 6) Training Strategy
### Phased Approach
1. **Prototype**: 50–200M params on a tiny dataset to validate the pipeline.
2. **Scale**: ~1.3B with your expanding corpus (slow but best quality on this GPU).
3. **Fine-Tune**: your personal style and memory formats.

### Your Dataset (`dataset.json`)
Since you already have a `dataset.json` with ~200 lines, use it to **prove the pipeline works**, then expand it later.

Suggested format (JSONL):
```json
{"text": "First training example..."}
{"text": "Second training example..."}
```

If your data is conversational, use a structured schema and convert it to plain text during preprocessing.

### Suggested Corpora (Examples)
- Open source datasets: **The Pile**, **RedPajama**, **OpenWebText**
- Clean aggressively to avoid junk or copyrighted content

---

## 7) Serving & Chat Orchestration
At runtime:
1. Load model + tokenizer
2. Retrieve memory snippets
3. Build prompt with memory
4. Generate response
5. Store new messages + embeddings

---

## 8) Example Repo Layout
```
self-made-ai/
  data/
    raw/
    processed/
  models/
  tokenizer/
  training/
    config.yaml
    train.py
    build_tokenizer.py
    prepare_dataset.py
  memory/
    db.sqlite
    memory_store.py
  serving/
    chat_cli.py
  README.md
  requirements.txt
```

---

## 9) What You Own & Control
- You **own the model weights** you train.
- You must ensure **training data licensing** is legal.
- You can keep the system fully offline for privacy.

---

## 10) Quick Start (Offline, From Scratch)
1. Install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Prepare your dataset (supports `data.json` or `dataset.json`):
   ```bash
   python training/prepare_dataset.py --input data/dataset.json --output data/processed/train.jsonl
   ```
3. Train tokenizer:
   ```bash
   python training/build_tokenizer.py --input data/processed/train.jsonl --output tokenizer --vocab-size 32000
   ```
4. Train from scratch:
   ```bash
   python training/train.py --config training/config.yaml
   ```
5. Run offline chat with persistent memory:
   ```bash
   python serving/chat_cli.py --model-dir models/base
   ```

---

If you want, I can expand this with **multi-GPU training**, **LoRA fine-tuning**, or a **local web UI**, all fully offline.
