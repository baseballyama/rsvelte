import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from 'svelte';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<div><div></div> <input/> <button>Toggle dark mode</button></div>`);

export default function _6_autoscroll_input($$anchor, $$props) {
	$.push($$props, true);

	let theme = 'dark';
	let messages = $.state($.proxy([]));
	let div;

	$.user_pre_effect(() => {
		$.get(messages);

		const autoscroll = div && div.offsetHeight + div.scrollTop > div.scrollHeight - 50;

		if (autoscroll) {
			tick().then(() => {
				div.scrollTo(0, div.scrollHeight);
			});
		}
	});

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			const text = event.target.value;

			if (!text) return;

			$.set(messages, [...$.get(messages), text], true);
			event.target.value = '';
		}
	}

	function toggle() {
		toggleValue = !toggleValue;
	}

	var div_1 = root_1();

	$.set_class(div_1, 1, '', null, {}, { dark: theme === 'dark' });

	var div_2 = $.child(div_1);

	$.each(div_2, 21, () => $.get(messages), $.index, ($$anchor, message) => {
		var p = root();
		var text_1 = $.only_child(p, true);

		$.template_effect(() => $.set_text(text_1, $.get(message)));
		$.append($$anchor, p);
	});

	$.reset(div_2);
	$.bind_this(div_2, ($$value) => viewport = $$value, () => viewport);

	var input = $.sibling(div_2, 2);
	var button = $.sibling(input, 2);

	$.reset(div_1);
	$.event('keydown', input, handleKeydown);
	$.event('click', button, toggle);
	$.append($$anchor, div_1);
	$.pop();
}