<script lang="ts">
  import Comp from './Comp.svelte';
  function myFade(node: Element, params: { duration: number }) { return { duration: params.duration }; }
</script>

<Comp transition:myFade={{ duration: 1 }} />
