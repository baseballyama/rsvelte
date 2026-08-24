let mode = $state("a");

if (mode === "a") {
  mode = "b";
}

for (const step of ["c", "d"]) {
  mode = step;
}

try {
  mode = mode.toUpperCase();
} catch {
  mode = "x";
}

switch (mode) {
  case "D":
    mode = "done";
    break;
  default:
    break;
}

label: {
  if (mode === "done") break label;
  mode = "unreached";
}

export function read() {
  return mode;
}
