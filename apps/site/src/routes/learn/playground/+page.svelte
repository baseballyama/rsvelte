<script lang="ts">
	import { readerLang } from '$lib/lang.svelte';
	import English from './page.en.svelte';
	import Japanese from './page.ja.svelte';
</script>

{#if readerLang() === 'en'}<English />{:else}<Japanese />{/if}
