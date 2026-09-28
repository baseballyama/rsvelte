import * as $ from 'svelte/internal/server';

export default function Component1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { object = void 0, primitive = void 0 } = $$props;

		if (primitive) {
			$$renderer.push(`<!--[0--><button>${$.escape(primitive)}</button>`);
		} else {
			$$renderer.push(`<!--[-1--><button>${$.escape(object.value)}</button>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { object, primitive });
	});
}