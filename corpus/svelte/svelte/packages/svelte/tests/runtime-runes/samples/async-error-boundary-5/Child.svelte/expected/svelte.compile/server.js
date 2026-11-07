import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { environment } = $$props;

		if (environment === 'client') {
			throw new Error('oops');
		}
	});
}