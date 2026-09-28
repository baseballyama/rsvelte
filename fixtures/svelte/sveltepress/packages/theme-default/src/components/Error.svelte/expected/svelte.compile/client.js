import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Home from './icons/Home.svelte';
import Link from './Link.svelte';

var root = $.from_html(`<div class="home-icon svelte-14iphrm"><!></div>`);
var root_1 = $.from_html(`<div class="error svelte-14iphrm"><div class="code svelte-14iphrm"> </div> <div class="title svelte-14iphrm"> </div> <!></div>`);

export default function Error($$anchor, $$props) {
	$.push($$props, true);

	const error = $.prop($$props, 'error', 19, () => ({}));
	var div = root_1();
	var div_1 = $.child(div);
	var text = $.only_child(div_1, true);
	var div_2 = $.sibling(div_1, 2);
	var text_1 = $.only_child(div_2, true);
	var node = $.sibling(div_2, 2);

	{
		const pre = ($$anchor) => {
			var div_3 = root();
			var node_1 = $.child(div_3);

			Home(node_1, {});
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		Link(node, { label: 'Take me home', to: '/', pre, $$slots: { pre: true } });
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, error().code || 404);
		$.set_text(text_1, error().message || 'Not Found');
	});

	$.append($$anchor, div);
	$.pop();
}