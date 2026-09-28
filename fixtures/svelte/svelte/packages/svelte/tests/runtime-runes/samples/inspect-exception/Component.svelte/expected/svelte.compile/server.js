import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { a = void 0 } = $$props;

		;;
		$$renderer.push(`<p>${$.escape(a)}</p>`);
		$.bind_props($$props, { a });
	});
}