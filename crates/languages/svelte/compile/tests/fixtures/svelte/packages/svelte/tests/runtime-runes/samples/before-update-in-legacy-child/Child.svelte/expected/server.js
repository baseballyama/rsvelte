import * as $ from 'svelte/internal/server';
import { beforeUpdate } from 'svelte';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let object = $$props['object'];

		beforeUpdate(() => {
			console.log('changed');
		});

		$.bind_props($$props, { object });
	});
}