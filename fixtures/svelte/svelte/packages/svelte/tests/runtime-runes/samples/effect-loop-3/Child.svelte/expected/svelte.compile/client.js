import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span><!></span>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let inited = $.state(false);

	$.user_effect(() => {
		$.set(inited, true);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var node_1 = $.child(span);

			$.snippet(node_1, () => $$props.children);
			$.reset(span);
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($.get(inited)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}