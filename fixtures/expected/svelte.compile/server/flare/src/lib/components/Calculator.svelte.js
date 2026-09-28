import * as $ from 'svelte/internal/server';
import { ArrowRight } from '@lucide/svelte';

export default function Calculator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { searchText, mathResult, mathResultType, isSelected, onSelect } = $$props;
		const inputWords = $.derived(() => isFinite(Number(searchText.trim())) ? numberToWords(searchText.trim()) : 'Expression');
		const resultWords = $.derived(() => isFinite(Number(mathResult)) ? numberToWords(mathResult) : mathResultType);

		function handleClick() {
			onSelect();
		}

		function numberToWords(numStr) {
			if (!numStr) return '';

			const digits = {
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

			const words = Array.from(numStr).map((char) => digits[char] || '').filter(Boolean).join(' ');
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

		if (mathResult) {
			$$renderer.push('<!--[0-->');

			function expression($$renderer, { value, words }) {
				$$renderer.push(`<div class="flex grow flex-col items-center gap-2"><div class="flex grow items-center truncate text-4xl font-medium">${$.escape(value)}</div> <div class="bg-input text-muted-foreground truncate rounded px-2 py-0.5 text-xs">${$.escape(words)}</div></div>`);
			}

			$$renderer.push(`<button type="button"${$.attr_class('w-full p-4 pt-2 text-left', void 0, { 'bg-accent': isSelected })}><div class="text-muted-foreground pb-1 text-xs">Calculator</div> <div class="bg-muted grid h-40 grid-cols-[1fr_auto_1fr] items-stretch rounded p-4">`);
			expression($$renderer, { value: searchText, words: inputWords() });
			$$renderer.push(`<!----> `);
			ArrowRight($$renderer, { class: 'text-muted-foreground mx-4 my-auto size-8' });
			$$renderer.push(`<!----> `);
			expression($$renderer, { value: mathResult, words: resultWords() });
			$$renderer.push(`<!----></div></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}