import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArrowRight } from '@lucide/svelte';

var root = $.from_html(`<div class="flex grow flex-col items-center gap-2"><div class="flex grow items-center truncate text-4xl font-medium"> </div> <div class="bg-input text-muted-foreground truncate rounded px-2 py-0.5 text-xs"> </div></div>`);
var root_1 = $.from_html(`<button type="button"><div class="text-muted-foreground pb-1 text-xs">Calculator</div> <div class="bg-muted grid h-40 grid-cols-[1fr_auto_1fr] items-stretch rounded p-4"><!> <!> <!></div></button>`);

export default function Calculator($$anchor, $$props) {
	$.push($$props, true);

	const inputWords = $.derived(() => isFinite(Number($$props.searchText.trim()))
		? numberToWords($$props.searchText.trim())
		: 'Expression');

	const resultWords = $.derived(() => isFinite(Number($$props.mathResult))
		? numberToWords($$props.mathResult)
		: $$props.mathResultType);

	function handleClick() {
		$$props.onSelect();
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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var button = root_1();
			let classes;

			{
				const expression = ($$anchor, $$arg0) => {
					let value = () => ($$arg0?.()).value;
					let words = () => ($$arg0?.()).words;
					var div = root();
					var div_1 = $.child(div);
					var text = $.only_child(div_1, true);
					var div_2 = $.sibling(div_1, 2);
					var text_1 = $.only_child(div_2, true);

					$.reset(div);

					$.template_effect(() => {
						$.set_text(text, value());
						$.set_text(text_1, words());
					});

					$.append($$anchor, div);
				};

				var div_3 = $.sibling($.child(button), 2);
				var node_1 = $.child(div_3);

				expression(node_1, () => ({ value: $$props.searchText, words: $.get(inputWords) }));

				var node_2 = $.sibling(node_1, 2);

				ArrowRight(node_2, { class: 'text-muted-foreground mx-4 my-auto size-8' });

				var node_3 = $.sibling(node_2, 2);

				expression(node_3, () => ({ value: $$props.mathResult, words: $.get(resultWords) }));
				$.reset(div_3);
				$.reset(button);
			}

			$.template_effect(() => classes = $.set_class(button, 1, 'w-full p-4 pt-2 text-left', null, classes, { 'bg-accent': $$props.isSelected }));
			$.delegated('click', button, handleClick);
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($$props.mathResult) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);