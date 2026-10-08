<script lang="ts">
	import '../app.css';
	import SearchPalette from '$lib/components/SearchPalette.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import { bilingual } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';

	let { data, children } = $props();

	const skip = bilingual('本文へ', 'Skip to content');
</script>

<a
	href="#main"
	class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-raised focus:px-3 focus:py-2 focus:shadow-[var(--shadow-pop)]"
	>{skip[readerLang()]}</a
>
<SiteHeader />
<div id="main">{@render children()}</div>
<SiteFooter rev={data.rev} />
<SearchPalette />
