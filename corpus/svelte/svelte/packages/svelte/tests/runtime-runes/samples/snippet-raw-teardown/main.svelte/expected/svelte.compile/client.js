import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createRawSnippet } from 'svelte';

var root = $.from_html(`<button>click</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let show = $.state(true);

	const snippet = createRawSnippet(() => ({
		render: () => `<hr>`,
		setup(p) {
			return () => console.log('tearing down');
		}
	}));

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			snippet($$anchor);
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(show, !$.get(show)));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);