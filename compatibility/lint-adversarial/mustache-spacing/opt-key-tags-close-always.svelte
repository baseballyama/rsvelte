<script>
	/* eslint svelte/mustache-spacing: ["warn",{"tags":{"closingBrace":"always"}}] */
</script>

<p>{x} { y }</p>
<div class={x} title={ y }>a</div>
<div style:color={x} class:on={ y }>b</div>
{#if x}a{/if}
{#if  x }b{/if}
