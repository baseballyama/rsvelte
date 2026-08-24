let a = $state("} ) ] closing delimiters in a string");
let b = $state("{ ( [ opening delimiters");
let c = $state(`a template with ${"}"} and ${"("} inside`);
let d = $state(/[)}\]]/g);
let e = $state({ "key}": ")", "key)": "}" });

const f = $derived(a.length + b.length + c.length + d.source.length);

const g = $derived.by(() => {
  const text = "}) inside a derived body";
  return text.length + f;
});

export function read() {
  return [a, b, c, d, e, f, g];
}
