import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';

var root = $.from_html(`<div class="message svelte-sb6kir"><span>Hello</span> <span>World</span></div>`);
var root_1 = $.from_html(`<div class="container"><!></div>`);

export default function Fade_transition($$anchor, $$props) {
	$.push($$props, true);

	let play = $.state(false);

	$.user_effect(() => {
		$.set(play, true);
	});

	setInterval(() => $.set(play, !$.get(play)), 2000);

	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var span = $.child(div_1);
			var span_1 = $.sibling(span, 2);

			$.reset(div_1);
			$.transition(3, span, () => fade, () => ({ duration: 600 }));
			$.transition(3, span_1, () => fade, () => ({ delay: 600 }));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(play)) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}