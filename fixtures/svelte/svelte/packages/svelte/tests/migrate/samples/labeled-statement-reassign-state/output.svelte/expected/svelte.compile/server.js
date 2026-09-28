import * as $ from 'svelte/internal/server';
import { run } from 'svelte/legacy';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let something = '123';
		let foo = false;

		run(() => {
			foo = !!something;
		});
	});
}