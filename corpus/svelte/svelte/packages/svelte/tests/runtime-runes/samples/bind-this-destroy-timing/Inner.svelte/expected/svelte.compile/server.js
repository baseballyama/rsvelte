import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const processed = $.derived(() => data.toUpperCase());

		function getProcessed() {
			return processed();
		}

		$.bind_props($$props, { getProcessed });
	});
}