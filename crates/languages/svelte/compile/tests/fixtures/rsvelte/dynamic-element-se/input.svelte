<script>let tag = $state('div'); let c = $state('red'); let { p } = $props();</script>
<svelte:element this={tag} style:color={c} style:width="1px" style:--x={c} />
<svelte:element this={tag} {...p} style:color|important={c} style="a: b" />
<svelte:element this={tag} style="margin: 0" style:color={c}>x</svelte:element>
