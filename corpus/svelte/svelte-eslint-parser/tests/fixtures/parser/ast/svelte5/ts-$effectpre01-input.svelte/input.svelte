<script lang="ts">
  let count = $state(0);
  const doubled = $derived(count * 2);

  $effect(() => {
    // runs when the component is mounted, and again
    // whenever `count` or `doubled` change,
    // after the DOM has been updated
    console.log({ count, doubled });

    return () => {
      // if a callback is provided, it will run
      // a) immediately before the effect re-runs
      // b) when the component is destroyed
      console.log("cleanup");
    };
  });
</script>

<button on:click="{() => count++}">
  {doubled}
</button>

<p>{count} doubled is {doubled}</p>
