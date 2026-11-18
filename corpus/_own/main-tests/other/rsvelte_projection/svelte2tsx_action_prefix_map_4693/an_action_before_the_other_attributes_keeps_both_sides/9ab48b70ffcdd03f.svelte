<script lang="ts">
  function tip(node: Element, text: string) { return { destroy() {} }; }
  const cls = "a";
</script>

<div use:tip={"hi"} class={cls}></div>
