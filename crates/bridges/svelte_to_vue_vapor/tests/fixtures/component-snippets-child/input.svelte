<script>
  let { children, header, value = 2 } = $props();
  let local = $state(0);
</script>
<section>
  {@render header?.(value + local)}
  {@render children?.()}
  <button class="child" onclick={() => local++}>child {local}</button>
</section>
