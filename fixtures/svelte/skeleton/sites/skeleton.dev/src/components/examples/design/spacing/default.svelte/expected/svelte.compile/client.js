import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="flex flex-col items-center gap-2"><span class="hidden md:block font-bold text-[10px] -rotate-90 whitespace-nowrap"> </span> <div></div></div>`);
var root_1 = $.from_html(`<div class="w-full space-y-4"><header class="flex flex-col items-center gap-4 max-h-96 mx-auto"><div><code class="code"> </code></div> <input class="input" type="range" step="0.01"/></header> <div class="w-full flex justify-between items-end"></div></div>`);

export default function Default($$anchor, $$props) {
	$.push($$props, true);

	const spacing = [
		{ value: '0.5', height: 'h-0.5' },
		{ value: '1', height: 'h-1' },
		{ value: '1.5', height: 'h-1.5' },
		{ value: '2', height: 'h-2' },
		{ value: '2.5', height: 'h-2.5' },
		{ value: '3', height: 'h-3' },
		{ value: '3.5', height: 'h-3.5' },
		{ value: '4', height: 'h-4' },
		{ value: '5', height: 'h-5' },
		{ value: '6', height: 'h-6' },
		{ value: '7', height: 'h-7' },
		{ value: '8', height: 'h-8' },
		{ value: '9', height: 'h-9' },
		{ value: '10', height: 'h-10' },
		{ value: '11', height: 'h-11' },
		{ value: '12', height: 'h-12' },
		{ value: '14', height: 'h-14' },
		{ value: '16', height: 'h-16' },
		{ value: '20', height: 'h-20' },
		{ value: '24', height: 'h-24' },
		{ value: '28', height: 'h-28' },
		{ value: '32', height: 'h-32' },
		{ value: '36', height: 'h-36' },
		{ value: '40', height: 'h-40' },
		{ value: '44', height: 'h-44' },
		{ value: '48', height: 'h-48' },
		{ value: '52', height: 'h-52' },
		{ value: '56', height: 'h-56' },
		{ value: '60', height: 'h-60' },
		{ value: '64', height: 'h-64' },
		{ value: '72', height: 'h-72' },
		{ value: '80', height: 'h-80' }
	].reverse();

	// Reactive
	let value = $.state(0.25);

	var div = root_1();
	var header = $.child(div);
	var div_1 = $.child(header);
	var code = $.child(div_1);
	var text = $.only_child(code);

	$.reset(div_1);

	var input = $.sibling(div_1, 2);

	$.remove_input_defaults(input);
	$.set_attribute(input, 'min', 0.2);
	$.set_attribute(input, 'max', 0.3);
	$.reset(header);

	var div_2 = $.sibling(header, 2);

	$.each(div_2, 20, () => spacing, (option) => option, ($$anchor, option) => {
		var div_3 = root();
		var span = $.child(div_3);
		var text_1 = $.only_child(span, true);
		var div_4 = $.sibling(span, 2);
		let styles;

		$.reset(div_3);

		$.template_effect(
			($0) => {
				$.set_text(text_1, $0);
				$.set_class(div_4, 1, `${option.height ?? ''} w-[5px] bg-primary-500`);
				styles = $.set_style(div_4, '', styles, { '--spacing': `${$.get(value)}rem` });
			},
			[() => option.height.replace('h-', '')]
		);

		$.append($$anchor, div_3);
	});

	$.reset(div_2);
	$.reset(div);
	$.template_effect(() => $.set_text(text, `--spacing: ${$.get(value) ?? ''}rem`));
	$.bind_value(input, () => $.get(value), ($$value) => $.set(value, $$value));
	$.append($$anchor, div);
	$.pop();
}