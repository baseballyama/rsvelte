import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { count } = $$props;
		let double = $.derived(() => count * 2);
	});
}