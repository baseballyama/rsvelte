import * as $ from 'svelte/internal/server';
import Widget from './Widget.svelte';

export default function Output($$renderer) {
	Widget($$renderer, {
		$$slots: {
			header: ($$renderer) => {
				$$renderer.push(`<h1 slot="header">Hello</h1>`);
			},

			footer: ($$renderer) => {
				{
					$$renderer.push(`<p>All rights reserved.</p> <p>Copyright (c) 2019 Svelte Industries</p>`);
				}
			}
		}
	});
}