<script>let v = $state(1);</script>
<svelte:head>
	<script async src="https://x/y.js" data-v={v}></script>
	<script>window.a = 1;</script>
</svelte:head>
<div>
	<script type="text/javascript">console.log("{v}");</script>
	<p>after</p>
</div>
<span><script src="/z.js"></script></span>
<div><style>p { color: red }</style><template><b>t</b></template></div>
{#if v}<script>a`${1}\n</script>{/if}
<span><script src={v}></script></span>
<p><script></script></p>
