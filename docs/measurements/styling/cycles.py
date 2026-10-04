import argparse
import ctypes
import hashlib
import json
from pathlib import Path
import shutil
import signal
import statistics
import subprocess

WARMUP_ROUNDS = 20
MEASURED_ROUNDS = 1000
WORKER_TIMEOUT_SECONDS = 60
GATE = "RSVELTE_CYCLE_GATE"


def timeout(_signal, _frame):
    raise TimeoutError("cycle worker timed out")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("population", type=Path)
    parser.add_argument("rewrite", type=Path)
    parser.add_argument("old", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    directory = Path(__file__).resolve().parent
    library_path = output / "process-counters.dylib"
    subprocess.run([
        "cc", "-O2", "-Wall", "-Wextra", "-Werror", "-dynamiclib",
        str(directory / "process-counters.c"), "-lproc", "-o", str(library_path),
    ], check=True)
    library = ctypes.CDLL(str(library_path), use_errno=True)
    library.read_process_counters.argtypes = [ctypes.c_int, ctypes.POINTER(ctypes.c_uint64)]
    library.read_process_counters.restype = ctypes.c_int
    node = shutil.which("node")
    if node is None:
        raise FileNotFoundError("node must be on PATH")
    population = args.population.resolve()
    inputs = sorted(population.glob("*/input.svelte"))
    if not inputs:
        raise ValueError("the population is empty")
    commands = {
        "official": [node, str(directory / "benchmark-official-cycles.cjs"), str(population)],
        "old": [str(args.old.resolve()), str(population)],
        "rewrite": [str(args.rewrite.resolve()), str(population)],
    }
    signal.signal(signal.SIGALRM, timeout)

    def counters(pid):
        values = (ctypes.c_uint64 * 2)()
        if library.read_process_counters(pid, values) != 0:
            raise OSError(ctypes.get_errno(), f"proc_pid_rusage({pid}) failed")
        if values[0] == 0 or values[1] == 0:
            raise ValueError("hardware counters are unavailable")
        return {"cycles": values[0], "instructions": values[1]}

    def run(arm, rounds, index):
        with (output / f"{index:02d}-{arm}.log").open("w") as log:
            proc = subprocess.Popen(
                [*commands[arm], str(rounds)], stdin=subprocess.PIPE,
                stdout=subprocess.PIPE, stderr=log, text=True,
            )
            signal.alarm(WORKER_TIMEOUT_SECONDS)
            try:
                if proc.stdout.readline().strip() != GATE:
                    raise ValueError(f"{arm} did not reach the first gate")
                before = counters(proc.pid)
                proc.stdin.write("g")
                proc.stdin.flush()
                if proc.stdout.readline().strip() != GATE:
                    raise ValueError(f"{arm} did not reach the second gate")
                after = counters(proc.pid)
                proc.stdin.write("g")
                proc.stdin.flush()
                raw = proc.stdout.read()
                proc.wait(timeout=WORKER_TIMEOUT_SECONDS)
                if proc.returncode != 0:
                    raise subprocess.CalledProcessError(proc.returncode, commands[arm])
            finally:
                signal.alarm(0)
                if proc.poll() is None:
                    proc.kill()
                    proc.wait()
        data = json.loads(raw)
        if data["documents"] != len(inputs) or data["rounds"] != rounds:
            raise ValueError("the worker measured another population")
        row = {"arm": arm, "trial": index, **data, "before": before, "after": after}
        for field in before:
            row[field] = after[field] - before[field]
            if row[field] <= 0:
                raise ValueError(f"{arm}: {field} did not advance")
        (output / f"{index:02d}-{arm}.json").write_text(json.dumps(row, indent=2) + "\n")
        return row

    rows = [run(arm, 0, index) for index, arm in enumerate(commands)]
    for arm in ["official", "old", "rewrite", "rewrite", "old", "official"] * 2:
        row = run(arm, MEASURED_ROUNDS, len(rows))
        rows.append(row)
        print(f"{arm}: {row['cycles']} cycles for {MEASURED_ROUNDS} rounds", flush=True)
    summary = {}
    for arm in commands:
        baseline = next(row for row in rows if row["arm"] == arm and row["rounds"] == 0)
        measured = [row for row in rows if row["arm"] == arm and row["rounds"] > 0]
        if any(row["cycles"] <= baseline["cycles"] for row in measured):
            raise ValueError(f"{arm}: added compilation did not increase cycles")
        if any(row["output_bytes"] != measured[0]["output_bytes"] for row in measured):
            raise ValueError(f"{arm}: output size changed between trials")
        samples = [row["cycles"] / row["rounds"] for row in measured]
        summary[arm] = {
            "median_cycles_per_population": statistics.median(samples),
            "min_cycles_per_population": min(samples),
            "max_cycles_per_population": max(samples),
            "median_cycles_per_input": statistics.median(samples) / len(inputs),
            "zero_round_gate_cycles": baseline["cycles"],
        }
    sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
    result = {
        "method": "proc_pid_rusage(RUSAGE_INFO_V4); ri_cycles and ri_instructions between stdin gates",
        "warmup_rounds": WARMUP_ROUNDS, "measured_rounds": MEASURED_ROUNDS,
        "population": len(inputs), "source_bytes": sum(path.stat().st_size for path in inputs),
        "commands": commands, "binary_sha256": {arm: sha(cmd[0]) for arm, cmd in commands.items()},
        "counter_library_sha256": sha(library_path),
        "driver_sha256": {str(path): sha(path) for path in [
            Path(__file__), directory / "process-counters.c", directory / "benchmark-official-cycles.cjs",
        ]},
        "input_sha256": {str(path.relative_to(population)): sha(path) for path in inputs},
        "rows": rows, "summary": summary,
    }
    (output / "results.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
