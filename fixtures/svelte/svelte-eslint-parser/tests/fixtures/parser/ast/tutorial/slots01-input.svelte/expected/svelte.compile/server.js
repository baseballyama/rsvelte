import * as $ from 'svelte/internal/server';
import Box from './Box.svelte';

export default function Slots01_input($$renderer) {
	Box($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h2>Hello!</h2> <p>This is a box. It can contain anything.</p> <div><p>I'm a child of the div</p></div>`);
		},
		$$slots: { default: true }
	});
}