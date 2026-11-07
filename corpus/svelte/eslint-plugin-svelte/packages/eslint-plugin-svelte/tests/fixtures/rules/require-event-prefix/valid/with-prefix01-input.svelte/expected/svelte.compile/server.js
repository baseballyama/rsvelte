import * as $ from 'svelte/internal/server';

export default function With_prefix01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { oncustom } = $$props;

		oncustom();
	});
}