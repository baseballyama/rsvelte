import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	let { data: pageData } = $$props;

	$$renderer.push(`<!---->${$.escape(pageData)}`);
}