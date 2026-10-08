<script lang="ts">
	import { bilingual } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';
	import { term } from '$lib/terms';
	let { name }: { name: string } = $props();
	const prefix = bilingual('コード上の名前', 'Name in code');
	const lang = $derived(readerLang());
</script>

<span title="{prefix[lang]}: {name}">{term(name, lang)}</span>
