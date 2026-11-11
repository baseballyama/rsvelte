<script>
  let count = $state(0);
  let visible = $state(true);
  let template = $state.raw();
  let observed = $state('');
  function sample() {
    const root = template.content;
    observed = JSON.stringify([
      root.querySelector('p').textContent,
      root.querySelector('p').getAttribute('title'),
      root.querySelector('template').content.textContent,
      root.querySelector('b')?.textContent ?? null,
      Array.from(root.querySelectorAll('li'), element => element.textContent)
    ]);
  }
</script>
<button onclick={() => count++}>change</button>
<button onclick={() => visible = !visible}>toggle</button>
<button onclick={sample}>sample</button>
<template bind:this={template} data-count={count}><p title={count}>value {count}</p><template><span>nested {count}</span></template>{#if visible}<b>shown {count}</b>{/if}<ul>{#each Array.from({length: count + 1}, (_, index) => index) as index}<li>{index}</li>{/each}</ul></template>
<output>{observed}</output>
