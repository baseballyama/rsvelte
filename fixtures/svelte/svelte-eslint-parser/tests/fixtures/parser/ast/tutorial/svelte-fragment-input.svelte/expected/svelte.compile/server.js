import * as $ from 'svelte/internal/server';
import Box from './Box.svelte';

export default function Svelte_fragment_input($$renderer) {
	Box($$renderer, {
		$$slots: {
			footer: ($$renderer) => {
				{
					$$renderer.push(`<p>All rights reserved.</p> <p>Copyright (c) 2019 Svelte Industries</p>`);
				}
			}
		}
	});
}