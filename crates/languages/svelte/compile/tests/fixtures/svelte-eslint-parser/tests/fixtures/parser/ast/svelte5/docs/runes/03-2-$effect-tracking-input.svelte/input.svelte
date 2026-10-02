<script>
  console.log("in component setup:", $effect.tracking()); // false

  $effect(() => {
    console.log("in effect:", $effect.tracking()); // true
  });
</script>

<p>in template: {$effect.tracking()}</p>
<!-- true -->
