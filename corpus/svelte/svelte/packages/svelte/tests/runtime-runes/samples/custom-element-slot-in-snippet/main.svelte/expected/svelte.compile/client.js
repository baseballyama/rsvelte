import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`Default <span slot="slot">Slotted</span>`, 1);

export default function Main($$anchor) {
	{
		const children = ($$anchor) => {
			$.next();

			var fragment_1 = root();

			$.next();
			$.append($$anchor, fragment_1);
		};

		Component($$anchor, { children, $$slots: { default: true } });
	}
}