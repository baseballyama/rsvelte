<script lang="ts">
	import { bilingual } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';
	import Icon from './Icon.svelte';
	let { code, label }: { code: string; label: string } = $props();
	let message = $state('');

	const text = bilingual(
		{
			copied: 'コピーしました',
			failed: 'コピーできませんでした。コードを選択してコピーしてください。',
			copy: 'コピー',
			copyLabel: (label: string) => `${label}をコピー`
		},
		{
			copied: 'Copied',
			failed: 'Could not copy. Select the code and copy it.',
			copy: 'Copy',
			copyLabel: (label: string) => `Copy ${label}`
		}
	);
	const t = $derived(text[readerLang()]);

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			message = t.copied;
		} catch {
			message = t.failed;
		}
	}
</script>

<figure class="my-6 min-w-0 overflow-hidden rounded-lg border border-line bg-sunken">
	<figcaption class="flex items-center justify-between gap-3 border-b border-line px-4 py-2 text-[13px] text-fg-2">
		<span>{label}</span>
		<button type="button" class="flex items-center gap-1.5 rounded px-2 py-1 hover:bg-surface hover:text-fg" onclick={copy} aria-label={t.copyLabel(label)}>
			<Icon name="copy" size={14} />{t.copy}
		</button>
	</figcaption>
	<pre class="thin-scrollbar overflow-x-auto p-4 text-[13px] leading-6"><code>{code}</code></pre>
	{#if message}<p class="border-t border-line px-4 py-2 text-[13px] text-fg-2" role="status">{message}</p>{/if}
</figure>
