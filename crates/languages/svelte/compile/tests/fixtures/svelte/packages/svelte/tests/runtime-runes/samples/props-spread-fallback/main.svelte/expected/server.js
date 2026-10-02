import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	let props = { propA: true, propB: undefined };

	$$renderer.push(`<button>change propA</button> <button>change propB</button> `);
	Component($$renderer, $.spread_props([props]));
	$$renderer.push(`<!---->`);
}