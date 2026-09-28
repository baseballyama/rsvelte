import * as $ from 'svelte/internal/server';
import B from './B.svelte';

export default function A($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { boolean, closed, close } = $$props;

		B($$renderer, {
			// this runs after the effect in B, because child effects run first
			closed,
			close
		});
	});
}