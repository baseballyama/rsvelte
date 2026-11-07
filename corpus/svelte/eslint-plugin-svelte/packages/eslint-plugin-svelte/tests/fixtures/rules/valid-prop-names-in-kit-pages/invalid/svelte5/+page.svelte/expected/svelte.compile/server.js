import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	let { foo, bar } = $$props;

	$$renderer.push(`<!---->${$.escape(foo)}, ${$.escape(bar)}`);
}