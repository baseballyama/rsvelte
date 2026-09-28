import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> `, 1);

export default function Output($$anchor) {
	let count = $.state($.proxy((void 0, 0)));

	// semicolon at the end
	let doubled = $.derived(() => (void 0, $.get(count) * 2));

	let $$d = $.derived(() => (void 0, { quadrupled: $.get(count) * 4 })),
		quadrupled = $.derived(() => $.get($$d).quadrupled);

	// no semicolon at the end
	let time_8 = $.derived(() => (void 0, $.get(count) * 8));

	let $$d_1 = $.derived(() => (void 0, { time_16: $.get(count) * 16 })),
		time_16 = $.derived(() => $.get($$d_1).time_16);

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.sibling(button);

	$.template_effect(() => $.set_text(text, ` ${$.get(count) ?? ''} / ${$.get(doubled) ?? ''} / ${$.get(quadrupled) ?? ''} / ${$.get(time_8) ?? ''} / ${$.get(time_16) ?? ''}`));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);