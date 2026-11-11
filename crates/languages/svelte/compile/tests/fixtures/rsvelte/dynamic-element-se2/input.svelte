<script>let tag = $state('div'); let c = $state('red');</script>
<svelte:element this={tag} id="a" class:x={c} style:color={c} />
<svelte:element this={tag} id="b" />
<style>div { color: red }</style>
