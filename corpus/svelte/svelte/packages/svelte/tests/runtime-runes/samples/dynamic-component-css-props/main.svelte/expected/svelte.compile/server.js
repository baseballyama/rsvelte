import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	let Comp = Component;

	$.css_props(
		$$renderer,
		true,
		{ '--color': 'red' },
		() => {
			if (Comp) {
				$$renderer.push('<!--[-->');
				Comp($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		true
	);
}