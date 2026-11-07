import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		throw new Error('layout render error');

		$$renderer.push(`<div id="throwing-layout">`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}