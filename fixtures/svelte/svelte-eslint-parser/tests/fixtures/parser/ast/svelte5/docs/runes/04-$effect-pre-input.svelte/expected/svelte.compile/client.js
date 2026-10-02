import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from 'svelte';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<div></div>`);

export default function _4_$effect_pre_input($$anchor, $$props) {
	$.push($$props, true);

	let div;
	let messages = [];

	// ...
	$.user_pre_effect(() => {
		if (!div) return; // not yet mounted

		// reference `messages` so that this code re-runs whenever it changes
		messages;

		// autoscroll when new messages are added
		if (div.offsetHeight + div.scrollTop > div.scrollHeight - 20) {
			tick().then(() => {
				div.scrollTo(0, div.scrollHeight);
			});
		}
	});

	var div_1 = root_1();

	$.each(div_1, 21, () => messages, $.index, ($$anchor, message) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, $.get(message)));
		$.append($$anchor, p);
	});

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => div = $$value, () => div);
	$.append($$anchor, div_1);
	$.pop();
}