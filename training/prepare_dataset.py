import argparse
import json
from pathlib import Path

def normalize_record(record: dict) -> str:
    if "text" in record:
        return record["text"]
    if "prompt" in record and "response" in record:
        return f"User: {record['prompt']}\nAssistant: {record['response']}"
    if "messages" in record:
        parts = []
        for message in record["messages"]:
            role = message.get("role", "user")
            content = message.get("content", "")
            parts.append(f"{role.title()}: {content}")
        return "\n".join(parts)
    return json.dumps(record, ensure_ascii=False)


def load_records(path: Path) -> list[dict]:
    if path.suffix.lower() == ".jsonl":
        return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict) and "data" in payload:
        return payload["data"]
    return [payload]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to dataset.json or dataset.jsonl")
    parser.add_argument("--output", required=True, help="Path to output JSONL")
    args = parser.parse_args()

    records = load_records(Path(args.input))
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", encoding="utf-8") as handle:
        for record in records:
            text = normalize_record(record)
            handle.write(json.dumps({"text": text}, ensure_ascii=False) + "\n")

    print(f"Wrote {len(records)} records to {output_path}")


if __name__ == "__main__":
    main()
