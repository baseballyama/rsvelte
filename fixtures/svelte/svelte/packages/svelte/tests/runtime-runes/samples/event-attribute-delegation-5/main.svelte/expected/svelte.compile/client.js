import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./Component.svelte";
import Button from "./Button.svelte";

export default function Main($$anchor) {
	Component($$anchor, {
		onclick: () => console.log('outer div onclick'),
		children: ($$anchor, $$slotProps) => {
			Component($$anchor, {
				$$events: { click: () => console.log('inner div on:click') },
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						onclick: () => console.log('button onclick'),
						$$events: { click: () => console.log('button on:click') },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('main');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}