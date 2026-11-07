import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { p } = $$props;
	});
}