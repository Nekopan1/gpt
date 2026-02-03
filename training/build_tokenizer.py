import argparse
from pathlib import Path

from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.pre_tokenizers import Whitespace
from tokenizers.trainers import BpeTrainer


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to JSONL file with a 'text' field")
    parser.add_argument("--output", required=True, help="Directory to write tokenizer files")
    parser.add_argument("--vocab-size", type=int, default=32000)
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    tokenizer = Tokenizer(BPE(unk_token="<unk>"))
    tokenizer.pre_tokenizer = Whitespace()
    trainer = BpeTrainer(
        vocab_size=args.vocab_size,
        special_tokens=["<pad>", "<unk>", "<bos>", "<eos>", "<mask>"],
    )

    tokenizer.train([str(input_path)], trainer)
    tokenizer.save(str(output_dir / "tokenizer.json"))

    print(f"Tokenizer saved to {output_dir / 'tokenizer.json'}")


if __name__ == "__main__":
    main()
