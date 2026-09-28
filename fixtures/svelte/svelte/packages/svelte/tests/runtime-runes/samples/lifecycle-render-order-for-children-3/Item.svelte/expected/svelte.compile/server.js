import * as $ from 'svelte/internal/server';

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { index, n } = $$props;

		function logRender() {
			console.log(`${index}: render ${n}`);

			return index;
		}

		$$renderer.push(`<li>${$.escape(logRender())}</li>`);
	});
}