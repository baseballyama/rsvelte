import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { foo, bar = 'bar', baz = void 0, buz = 'buz' } = $$props;

		$$renderer.push(`<button>update</button> ${$.escape(foo)}
${$.escape(bar)}
${$.escape(baz)}
${$.escape(buz)}`);

		$.bind_props($$props, { baz, buz });
	});
}