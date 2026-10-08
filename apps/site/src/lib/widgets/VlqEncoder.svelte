<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { bilingual } from '$lib/i18n';
	import { vlqDigits } from '$lib/kernel/emit';
	import { readerLang } from '$lib/lang.svelte';

	const text = bilingual(
		{
			label: '図 9.2 · 可変長の整数表現',
			value: '値',
			signToLowestBit: '符号を最下位ビットへ',
			caption:
				'5 ビットずつ下の桁から取り、続きがあれば 6 ビット目（橙）を立てて base64 の 1 文字にします。ボタンの値は、カーネルの 可変長の整数表現 テストと同じ入力です（`"A C D gB w+B"`）。'
		},
		{
			label: 'Figure 9.2 · Variable-length integers',
			value: 'Value',
			signToLowestBit: 'Sign moved to the lowest bit',
			caption:
				'Take 5 bits at a time from the low end. When more digits follow, set the 6th bit (orange). Each group becomes 1 base64 character. The button values are the inputs of the kernel test for variable-length integers (`"A C D gB w+B"`).'
		}
	);
	const t = $derived(text[readerLang()]);

	let value = $state(1000);
	const digits = $derived(vlqDigits(Math.trunc(value || 0)));
	const shifted = $derived(value < 0 ? -Math.trunc(value) * 2 + 1 : Math.trunc(value) * 2);
</script>

<Figure label={t.label}>
	{#snippet controls()}
		{#each [0, 1, -1, 16, 1000] as v (v)}
			<button type="button" class="btn-ghost" aria-pressed={value === v} onclick={() => (value = v)}>{v}</button>
		{/each}
	{/snippet}
	<div class="p-4 font-mono text-[13px] tracking-normal">
		<label class="flex items-center gap-3">
			<span class="text-muted">{t.value}</span>
			<input class="field w-32 py-1" type="number" bind:value />
		</label>
		<p class="mt-3 text-fg-2">
			{t.signToLowestBit}: {Math.trunc(value || 0)} → {shifted} = <span class="tnum">{shifted.toString(2)}</span><sub class="text-muted">2</sub>
		</p>
		<div class="mt-3 flex flex-wrap gap-2">
			{#each digits as d, i (i)}
				<div class="rounded-sm border border-line px-2.5 py-1.5">
					<div>
						<span class={d.continued ? 'text-accent' : 'text-muted'}>{d.continued ? '1' : '0'}</span><span class="tnum"
							>{d.bits.toString(2).padStart(5, '0')}</span
						>
					</div>
					<div class="mt-0.5 text-center text-[16px] font-medium">{d.char}</div>
				</div>
			{/each}
		</div>
	</div>
	{#snippet caption()}
		<!-- Text between backticks is code. -->
		{#each t.caption.split('`') as part, i (i)}{#if i % 2}<code>{part}</code>{:else}{part}{/if}{/each}
	{/snippet}
</Figure>
