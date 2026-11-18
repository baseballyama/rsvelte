<svelte:options runes={false} />

<script>
  let count = 0;

  function bump() {
    count += 1;
  }
</script>

<button on:click|preventDefault={bump}>a</button>
<button on:click|stopPropagation={bump}>b</button>
<button on:click|stopImmediatePropagation={bump}>c</button>
<button on:click|capture={bump}>d</button>
<button on:click|once={bump}>e</button>
<button on:click|self={bump}>f</button>
<button on:click|trusted={bump}>g</button>
<div on:scroll|passive={bump}>h</div>
<div on:scroll|nonpassive={bump}>i</div>
<button on:click|preventDefault|stopPropagation|once|capture|self={bump}
  >j</button
>
<button on:click>k</button>
<b>{count}</b>
