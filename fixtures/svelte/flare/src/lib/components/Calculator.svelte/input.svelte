<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';

	type Props = {
		searchText: string;
		mathResult: string;
		mathResultType: string;
		isSelected: boolean;
		onSelect: () => void;
	};

	let { searchText, mathResult, mathResultType, isSelected, onSelect }: Props = $props();

	const inputWords = $derived(
		isFinite(Number(searchText.trim())) ? numberToWords(searchText.trim()) : 'Expression'
	);
	const resultWords = $derived(
		isFinite(Number(mathResult)) ? numberToWords(mathResult) : mathResultType
	);

	function handleClick() {
		onSelect();
	}

	function numberToWords(numStr: string | null): string {
		if (!numStr) return '';

		const digits: { [key: string]: string } = {
			'0': 'Zero',
			'1': 'One',
			'2': 'Two',
			'3': 'Three',
			'4': 'Four',
			'5': 'Five',
			'6': 'Six',
			'7': 'Seven',
			'8': 'Eight',
			'9': 'Nine',
			'.': 'Point',
			'-': 'Minus'
		};

		const words = Array.from(numStr)
			.map((char) => digits[char] || '')
			.filter(Boolean)
			.join(' ');

		const maxLength = 35;
		if (words.length > maxLength) {
			let truncated = words.substring(0, maxLength);
			const lastSpace = truncated.lastIndexOf(' ');
			if (lastSpace > -1) {
				truncated = truncated.substring(0, lastSpace);
			}
			return truncated + '...';
		}
		return words;
	}
</script>

{#if mathResult}
	<button
		type="button"
		class="w-full p-4 pt-2 text-left"
		class:bg-accent={isSelected}
		onclick={handleClick}
	>
		<div class="text-muted-foreground pb-1 text-xs">Calculator</div>
		{#snippet expression({ value, words }: { value: string | null; words: string | null })}
			<div class="flex grow flex-col items-center gap-2">
				<div class="flex grow items-center truncate text-4xl font-medium">{value}</div>
				<div class="bg-input text-muted-foreground truncate rounded px-2 py-0.5 text-xs">
					{words}
				</div>
			</div>
		{/snippet}
		<div class="bg-muted grid h-40 grid-cols-[1fr_auto_1fr] items-stretch rounded p-4">
			{@render expression({ value: searchText, words: inputWords })}
			<ArrowRight class="text-muted-foreground mx-4 my-auto size-8" />
			{@render expression({ value: mathResult, words: resultWords })}
		</div>
	</button>
{/if}
