import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { count } = $$props;

		const d = $.derived(() => {
			if (count === 1) {
				throw new Error('kaboom');
			}

			return count;
		});
	});
}