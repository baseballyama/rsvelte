import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(` <!> `, 1);

export default function Hover_$store($$anchor, $$props) {
	$.push($$props, true);

	const $b = () => $.store_get(b, '$b', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const b = writable('');

	$b();

	if (typeof $b() === 'string') {
		$b();
	}

	b;
	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var node = $.sibling(text);

	{
		var consequent = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, $b()));
			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if (typeof $b() === 'string') $$render(consequent);
		});
	}

	var text_2 = $.sibling(node);

	$.template_effect(() => {
		$.set_text(text, `${$b() ?? ''} `);
		$.set_text(text_2, ` ${b ?? ''}`);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}