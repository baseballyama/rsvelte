import * as $ from 'svelte/internal/server';
import { run } from 'svelte/legacy';
import { blah } from './blah.js';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let bar = void 0;
		let foo = $.derived(() => data.foo);

		run(() => {
			bar = [];

			let baz;
		});
	});
}