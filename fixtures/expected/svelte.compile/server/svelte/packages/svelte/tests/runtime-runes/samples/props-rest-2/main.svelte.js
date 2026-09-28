import * as $ from 'svelte/internal/server';
import Component from "./Component.svelte";

export default function Main($$renderer) {
	Component($$renderer, {
		name: 'n',
		title: 't',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Foo`);
		},
		$$slots: { default: true }
	});
}