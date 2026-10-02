import * as $ from 'svelte/internal/server';

export default function Component3($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { count = void 0 } = $$props;

		$$renderer.push(`<button>${$.escape(count.value)}</button>`);
		$.bind_props($$props, { count });
	});
}