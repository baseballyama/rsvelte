import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="w-full space-y-4"><header class="flex flex-col items-center gap-4 max-w-96 mx-auto"><div><code class="code"> </code></div> <input class="input" type="range" min="0"/></header> <div class="flex items-center gap-8 overflow-y-auto pb-8"><div class="flex flex-col items-center gap-1"><div><span class="text-9xl">Aa</span></div> <code class="code">text-9xl</code></div> <div class="flex flex-col items-center gap-1"><div><span class="text-8xl">Aa</span></div> <code class="code">text-8xl</code></div> <div class="flex flex-col items-center gap-1"><div><span class="text-7xl">Aa</span></div> <code class="code">text-7xl</code></div> <div class="flex flex-col items-center gap-1"><div><span class="text-6xl">Aa</span></div> <code class="code">text-6xl</code></div> <div class="flex flex-col items-center gap-1"><div><span class="text-5xl">Aa</span></div> <code class="code">text-5xl</code></div> <div class="flex flex-col items-center gap-1"><div><span class="text-4xl">Aa</span></div> <code class="code">text-4xl</code></div> <div class="flex flex-col items-center gap-1"><div><span class="text-3xl">Aa</span></div> <code class="code">text-3xl</code></div> <div class="flex flex-col items-center gap-1"><div><span class="text-2xl">Aa</span></div> <code class="code">text-2xl</code></div> <div class="flex flex-col items-center gap-1"><div><span class="text-xl">Aa</span></div> <code class="code">text-xl</code></div> <div class="flex flex-col items-center gap-1"><div><span class="text-lg">Aa</span></div> <code class="code">text-lg</code></div> <div class="flex flex-col items-center gap-1"><div><span class="text-base">Aa</span></div> <code class="code">text-base</code></div> <div class="flex flex-col items-center gap-1"><div><span class="text-sm">Aa</span></div> <code class="code">text-sm</code></div> <div class="flex flex-col items-center gap-2"><div><span class="text-xs">Aa</span></div> <code class="code">text-xs</code></div></div></div>`);

export default function Typescale($$anchor) {
	const options = [1, 1.067, 1.125, 1.2, 1.25, 1.333, 1.414, 1.5, 1.618];

	// Reactive
	let value = $.state(0);

	const current = $.derived(() => options[$.get(value)]);
	var div = root();
	var header = $.child(div);
	var div_1 = $.child(header);
	var code = $.child(div_1);
	var text = $.only_child(code);

	$.reset(div_1);

	var input = $.sibling(div_1, 2);

	$.remove_input_defaults(input);
	$.reset(header);

	var div_2 = $.sibling(header, 2);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	let styles;

	$.next(2);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var div_6 = $.child(div_5);
	let styles_1;

	$.next(2);
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var div_8 = $.child(div_7);
	let styles_2;

	$.next(2);
	$.reset(div_7);

	var div_9 = $.sibling(div_7, 2);
	var div_10 = $.child(div_9);
	let styles_3;

	$.next(2);
	$.reset(div_9);

	var div_11 = $.sibling(div_9, 2);
	var div_12 = $.child(div_11);
	let styles_4;

	$.next(2);
	$.reset(div_11);

	var div_13 = $.sibling(div_11, 2);
	var div_14 = $.child(div_13);
	let styles_5;

	$.next(2);
	$.reset(div_13);

	var div_15 = $.sibling(div_13, 2);
	var div_16 = $.child(div_15);
	let styles_6;

	$.next(2);
	$.reset(div_15);

	var div_17 = $.sibling(div_15, 2);
	var div_18 = $.child(div_17);
	let styles_7;

	$.next(2);
	$.reset(div_17);

	var div_19 = $.sibling(div_17, 2);
	var div_20 = $.child(div_19);
	let styles_8;

	$.next(2);
	$.reset(div_19);

	var div_21 = $.sibling(div_19, 2);
	var div_22 = $.child(div_21);
	let styles_9;

	$.next(2);
	$.reset(div_21);

	var div_23 = $.sibling(div_21, 2);
	var div_24 = $.child(div_23);
	let styles_10;

	$.next(2);
	$.reset(div_23);

	var div_25 = $.sibling(div_23, 2);
	var div_26 = $.child(div_25);
	let styles_11;

	$.next(2);
	$.reset(div_25);

	var div_27 = $.sibling(div_25, 2);
	var div_28 = $.child(div_27);
	let styles_12;

	$.next(2);
	$.reset(div_27);
	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, `--text-scaling: ${$.get(current) ?? ''}`);
		$.set_attribute(input, 'max', options.length - 1);
		styles = $.set_style(div_4, '', styles, { '--text-scaling': $.get(current) });
		styles_1 = $.set_style(div_6, '', styles_1, { '--text-scaling': $.get(current) });
		styles_2 = $.set_style(div_8, '', styles_2, { '--text-scaling': $.get(current) });
		styles_3 = $.set_style(div_10, '', styles_3, { '--text-scaling': $.get(current) });
		styles_4 = $.set_style(div_12, '', styles_4, { '--text-scaling': $.get(current) });
		styles_5 = $.set_style(div_14, '', styles_5, { '--text-scaling': $.get(current) });
		styles_6 = $.set_style(div_16, '', styles_6, { '--text-scaling': $.get(current) });
		styles_7 = $.set_style(div_18, '', styles_7, { '--text-scaling': $.get(current) });
		styles_8 = $.set_style(div_20, '', styles_8, { '--text-scaling': $.get(current) });
		styles_9 = $.set_style(div_22, '', styles_9, { '--text-scaling': $.get(current) });
		styles_10 = $.set_style(div_24, '', styles_10, { '--text-scaling': $.get(current) });
		styles_11 = $.set_style(div_26, '', styles_11, { '--text-scaling': $.get(current) });
		styles_12 = $.set_style(div_28, '', styles_12, { '--text-scaling': $.get(current) });
	});

	$.bind_value(input, () => $.get(value), ($$value) => $.set(value, $$value));
	$.append($$anchor, div);
}