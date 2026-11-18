<script lang="ts">
  let a: number = $state(1);
  // c
  $effect(() => {
    console.log(a);
  });
</script>
