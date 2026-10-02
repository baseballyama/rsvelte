import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Output($$anchor) {
	let count = 0;

	// semicolon at the end
	let doubled = $.derived(() => count * 2);

	let $$d = $.derived(() => ({ quadrupled: count * 4 })),
		quadrupled = $.derived(() => $.get($$d).quadrupled);

	// no semicolon at the end
	let time_8 = $.derived(() => count * 8);

	let $$d_1 = $.derived(() => ({ time_16: count * 16 })),
		time_16 = $.derived(() => $.get($$d_1).time_16);

	// preceding let that doesn't do anything
	let time_32 = $.derived(() => count * $.get(doubled));

	let very_high = $.derived(() => $.get(time_32) * count);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `0 / ${$.get(doubled) ?? ''} / ${$.get(quadrupled) ?? ''} / ${$.get(time_8) ?? ''} / ${$.get(time_16) ?? ''}`));
	$.append($$anchor, text);
}