import argparse
import json
import re
import subprocess
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("manifest")
parser.add_argument("output", type=Path)
parser.add_argument("--before", required=True)
parser.add_argument("--after", required=True)
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
for arm in ["before", "after"]:
    rows = []
    for phase in ["total", "parse", "hir", "resolve", "analyze", "identity", "emit"]:
        result = subprocess.run([getattr(args, arm), args.manifest, phase, "1"], text=True, capture_output=True, check=True)
        (args.output / f"{arm}-{phase}.stdout").write_text(result.stdout)
        (args.output / f"{arm}-{phase}.stderr").write_text(result.stderr)
        row = json.loads(result.stdout)
        assert row["documents"] == 453 and row["rounds"] == 1
        match = re.fullmatch(r"allocations=(\d+) bytes=(\d+) peak_live_growth=(\d+)\n", result.stderr)
        assert match is not None
        row.update(dict(zip(["allocations", "bytes", "peak_live_growth"], map(int, match.groups()))))
        rows.append(row)
    (args.output / f"{arm}.json").write_text(json.dumps(rows, indent=2) + "\n")
    print(arm, rows[0], flush=True)
