<script lang="ts">
  function tip(node: Element, text: string) { return { destroy() {} }; }
  function log(node: Element) { return { destroy() {} }; }
  const cls = "a";
</script>

<div class={cls} use:tip={"hi"} use:log></div>
