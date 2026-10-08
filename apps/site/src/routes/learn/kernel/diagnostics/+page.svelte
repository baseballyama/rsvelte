<script lang="ts">
	import { readerLang } from '$lib/lang.svelte';
	import English from './page.en.svelte';
	import Japanese from './page.ja.svelte';

	let { data } = $props();
</script>

{#if readerLang() === 'en'}<English {data} />{:else}<Japanese {data} />{/if}
