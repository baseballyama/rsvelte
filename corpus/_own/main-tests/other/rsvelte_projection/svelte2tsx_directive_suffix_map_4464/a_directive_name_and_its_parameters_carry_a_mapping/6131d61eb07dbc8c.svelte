<script lang="ts">
  function myFade(node: Element, params: { duration: number }) { return { duration: params.duration }; }
  function flipper(node: Element, rect: DOMRect) { return { duration: 1 }; }
  const cls = "a";
</script>

<div class={cls} transition:myFade={{ duration: 1 }} animate:flipper></div>
