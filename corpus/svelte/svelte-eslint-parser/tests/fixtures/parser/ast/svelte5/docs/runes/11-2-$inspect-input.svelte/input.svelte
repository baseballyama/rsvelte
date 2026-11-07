<script>
  let count = $state(0);

  $inspect(count).with((type, count) => {
    if (type === "update") {
      debugger; // or `console.trace`, or whatever you want
    }
  });
</script>

<button onclick="{() => count++}">Increment</button>
