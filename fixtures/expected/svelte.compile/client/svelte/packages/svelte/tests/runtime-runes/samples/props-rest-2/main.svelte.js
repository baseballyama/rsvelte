import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./Component.svelte";

export default function Main($$anchor) {
	Component($$anchor, {
		name: 'n',
		title: 't',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Foo');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}