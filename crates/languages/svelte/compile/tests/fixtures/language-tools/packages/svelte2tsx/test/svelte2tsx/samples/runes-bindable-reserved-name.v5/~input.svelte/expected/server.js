import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { a, class: className = void 0 } = $$props;

		$.bind_props($$props, { class: className });
	});
}