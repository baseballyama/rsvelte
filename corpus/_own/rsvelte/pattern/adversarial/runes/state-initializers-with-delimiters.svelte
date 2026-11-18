<script>
  let a = $state("} ) ] in a string");
  let b = $state(`template ${"}"} hole`);
  let c = $state(/[)}\]]/g);
  let d = $state({ "k}": ")" });
  let e = $state([")", "}", "]"]);

  const f = $derived(a.length + b.length + c.source.length);

  function write() {
    a = "} another )";
    b = `${"}"}`;
    d = { "k)": "}" };
    e = ["}"];
  }
</script>

<b>{a}{b}{c.source}</b>
<b>{d["k}"] ?? d["k)"]}</b>
<b>{e.join("")}{f}</b>
<button onclick={write}>go</button>
