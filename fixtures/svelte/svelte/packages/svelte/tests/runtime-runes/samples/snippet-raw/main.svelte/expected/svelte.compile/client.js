import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createRawSnippet } from 'svelte';

var root = $.from_html(`<button>click</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	const hello = createRawSnippet((count) => ({
		render: () => `
			<p>clicks: ${count()}</p>
		`,

		setup(p) {
			$.user_effect(() => {
				p.textContent = `clicks: ${count()}`;
			});
		}
	}));

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	hello(node, () => $.get(count));
	$.delegated('click', button, () => $.set(count, $.get(count) + 1));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);