import * as $ from 'svelte/internal/server';

export default function AdminSearch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { text = '' } = $$props;

		$$renderer.push(`<input type="text"${$.attr('value', text)} placeholder="Search" class="svelte-2dcw36"/>`);
		$.bind_props($$props, { text });
	});
}