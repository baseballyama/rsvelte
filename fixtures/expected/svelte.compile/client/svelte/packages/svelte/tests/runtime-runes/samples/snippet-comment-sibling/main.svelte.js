import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from "./Child.svelte";

export default function Main($$anchor) {
	{
		const children = ($$anchor) => {
			$.next();

			var text = $.text('The content');

			$.append($$anchor, text);
		};

		Child($$anchor, { children, $$slots: { default: true } });
	}
}