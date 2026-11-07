import * as $ from 'svelte/internal/server';

export default function Sub($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { inc, count = void 0 } = $$props;

		$$renderer.push(`<button>${$.escape(count.a)} (ok)</button> <button>${$.escape(count.a)} (bad)</button>`);
		$.bind_props($$props, { count });
	});
}