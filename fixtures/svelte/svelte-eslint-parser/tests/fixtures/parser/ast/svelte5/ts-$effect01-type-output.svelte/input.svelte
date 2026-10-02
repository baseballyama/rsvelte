<script lang="ts">
  let count = $state(0); // count: number, $state(0): 0
  let doubled = $derived(count * 2); // doubled: number, $derived(count * 2): number

  $effect(() => { // $effect(() => { // runs when the component is mounted, and again // whenever `count` or `doubled` change, // after the DOM has been updated console.log({ count, doubled }); return () => { // if a callback is provided, it will run // a) immediately before the effect re-runs // b) when the component is destroyed console.log("cleanup"); }; }): void
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

<button on:click="{() => count++}"> <!-- count: number -->
  {doubled} <!-- doubled: number -->
</button>

<p>{count} doubled is {doubled}</p> <!-- count: number, doubled: number -->
