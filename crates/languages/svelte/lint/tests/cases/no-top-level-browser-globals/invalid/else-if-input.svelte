<script>
	import { browser } from '$app/environment';
	let x = 1;
</script>
{#if browser}
	{location.href}
{:else if x}
	{location.href}
{/if}
