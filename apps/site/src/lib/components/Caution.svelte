<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import { bilingual } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';

	let { children }: { children: Snippet } = $props();

	const label = bilingual('注意', 'Caution');
</script>

<aside class="callout callout-caution" aria-label={label[readerLang()]}>
	<span class="callout-label"><Icon name="warn" size={13} />{label[readerLang()]}</span>
	<div class="text-fg">{@render children()}</div>
</aside>
