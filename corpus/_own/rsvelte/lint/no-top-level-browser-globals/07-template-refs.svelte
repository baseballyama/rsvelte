<script>
	import { browser } from '$app/environment';
	void browser;
</script>
<p>{window.innerWidth}</p>
{#if browser}
	<p>{window.innerHeight}</p>
{:else}
	<p>ssr</p>
{/if}
{#snippet probe()}
	<span>{document.title}</span>
{/snippet}
{@render probe()}
