import * as $ from 'svelte/internal/server';
import { num, increment } from './state.svelte.js';
import Component from './Component.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function foo() {
			increment();
			console.log(num);
		}

		Component($$renderer, { foo });
	});
}