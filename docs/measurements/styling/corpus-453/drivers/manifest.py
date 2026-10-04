import hashlib
import json
import sys
from pathlib import Path

repo = Path(sys.argv[1]).resolve()
population = json.loads((Path(__file__).resolve().parents[1] / "population.json").read_text())
assert population["population"] == len(population["rows"]) == 453
assert len({row["unit"] for row in population["rows"]}) == 453
for row in population["rows"]:
    unit = repo / "fixtures/svelte" / row["unit"]
    source = unit / "input.svelte"
    css = unit / "expected/svelte.compile/client.css"
    for key, path in [("source", source), ("css", css)]:
        assert hashlib.sha256(path.read_bytes()).hexdigest() == row["sha256"][key], path
    filename = row["unit"].split("/", 1)[1].replace("~", "")
    print(f"{filename}\t{source}\t{css}")
