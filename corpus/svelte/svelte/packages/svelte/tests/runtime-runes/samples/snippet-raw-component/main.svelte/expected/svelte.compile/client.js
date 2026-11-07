import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createRawSnippet, hydrate } from 'svelte';
import { render } from 'svelte/server';
import Child from './Child.svelte';

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

	hello($$anchor);
	$.pop();
}