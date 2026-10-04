import argparse
import json
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
    with (args.output / f"{arm}.stderr").open("w") as log:
        proc = subprocess.Popen([getattr(args, arm), args.manifest, "total", "0"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=log, text=True)
        try:
            assert proc.stdout.readline().strip() == "RSVELTE_CYCLE_GATE"
            for mode in ["summary", "map"]:
                command = ["vmmap", "-summary", str(proc.pid)] if mode == "summary" else ["vmmap", str(proc.pid)]
                result = subprocess.run(command, capture_output=True, text=True, check=True)
                (args.output / f"{arm}-{mode}.txt").write_text(result.stdout)
                (args.output / f"{arm}-{mode}.stderr").write_text(result.stderr)
            proc.stdin.write("g"); proc.stdin.flush()
            assert proc.stdout.readline().strip() == "RSVELTE_CYCLE_GATE"
            proc.stdin.write("g"); proc.stdin.flush()
            result = json.loads(proc.stdout.read())
            assert result["documents"] == 453 and result["rounds"] == 0
            proc.wait(timeout=30)
            assert proc.returncode == 0
            print(arm, "warm memory map saved", flush=True)
        finally:
            if proc.poll() is None:
                proc.kill(); proc.wait()
