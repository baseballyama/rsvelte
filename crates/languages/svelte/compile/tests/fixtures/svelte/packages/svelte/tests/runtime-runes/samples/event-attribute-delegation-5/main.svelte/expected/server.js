import * as $ from 'svelte/internal/server';
import Component from "./Component.svelte";
import Button from "./Button.svelte";

export default function Main($$renderer) {
	Component($$renderer, {
		onclick: () => console.log('outer div onclick'),
		children: ($$renderer) => {
			Component($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						onclick: () => console.log('button onclick'),
						children: ($$renderer) => {
							$$renderer.push(`<!---->main`);
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