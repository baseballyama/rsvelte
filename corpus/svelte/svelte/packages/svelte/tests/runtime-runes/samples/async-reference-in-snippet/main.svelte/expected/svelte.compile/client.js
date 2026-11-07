import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import App from './app.svelte';

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const pending = ($$anchor) => {};

		$.boundary(node, { pending }, ($$anchor) => {
			App($$anchor, {});
		});
	}

	$.append($$anchor, fragment);
}