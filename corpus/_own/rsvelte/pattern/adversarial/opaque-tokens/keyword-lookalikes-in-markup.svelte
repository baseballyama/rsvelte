<script>
  let n = $state(1);
</script>

<b>the word class appears here</b>
<b>{"$state(0) in a template string"}</b>
<b>{`$derived(${n})`}</b>
<div title="$state(1) in an attribute">a</div>
<div data-a={"$effect(() => {})"}>b</div>

{#if n}
  <b>class function return typeof</b>
{/if}

{#each ["$props()"] as text}
  <b>{text}</b>
{/each}

<!-- $state(0) in a markup comment -->

<style>
  /* $derived(1) in a css comment */
  b::after {
    content: "$state(2) in a css string";
  }
</style>
