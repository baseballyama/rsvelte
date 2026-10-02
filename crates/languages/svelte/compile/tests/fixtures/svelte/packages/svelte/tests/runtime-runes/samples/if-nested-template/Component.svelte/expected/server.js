import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value } = $$props;
		const text = $.derived(() => value.toString());
	});
}