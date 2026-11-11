<script>
  let n = $state(0);

  const bump = () => (n += 1);
</script>

<button onclick={bump}>a</button>
<button onclickcapture={bump}>b</button>
<div onpointerdown={bump} onpointerup={bump}>c</div>
<input oninput={bump} onchange={bump} onbeforeinput={bump} />
<form onsubmit={bump} onreset={bump}>
  <button type="submit">d</button>
</form>
<div ondragstart={bump} ondragover={bump} ondrop={bump}>e</div>
<details ontoggle={bump}><summary>f</summary></details>
<div onanimationend={bump} ontransitionend={bump}>g</div>
<div oncopy={bump} oncut={bump} onpaste={bump}>h</div>
<b>{n}</b>
