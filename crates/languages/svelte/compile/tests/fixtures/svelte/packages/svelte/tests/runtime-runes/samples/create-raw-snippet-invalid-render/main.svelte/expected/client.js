import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createRawSnippet } from 'svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const snippet = createRawSnippet(() => ({
		render: () => `
			<!-- --><div>123</div>
		`
	}));

	snippet($$anchor);
	$.pop();
}