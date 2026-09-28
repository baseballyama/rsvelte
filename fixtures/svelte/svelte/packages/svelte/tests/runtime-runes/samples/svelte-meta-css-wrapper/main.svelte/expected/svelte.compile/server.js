import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<h1>hello</h1> `);

	$.css_props($$renderer, true, { '--color': 'red' }, () => {
		Component($$renderer, {});
	});

	$$renderer.push(` <p>goodbye</p>`);
}