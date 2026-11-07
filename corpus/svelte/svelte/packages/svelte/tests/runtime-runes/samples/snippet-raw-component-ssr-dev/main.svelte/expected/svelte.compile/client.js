import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createRawSnippet, hydrate } from 'svelte';
import { render } from 'svelte/server';
import Child from './Child.svelte';

var root = $.from_html(`<div><!></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = 0;

	const hello = createRawSnippet((count) => ({
		render: () => `
			<div>${$$props.browser ? '' : render(Child).body}</div>
		`,

		setup(target) {
			hydrate(Child, { target });
		}
	}));

	var div = root();
	var node = $.child(div);

	hello(node);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}