import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			foo,
			default1 = 1,
			default2 = 2,
			default3 = 3,
			$$slots,
			$$events,
			...others
		} = $$props;

		$$renderer.push(`<!---->${$.escape(foo)} ${$.escape(default1)} ${$.escape(default2)} ${$.escape(default3)} ${$.escape(others.bar)}`);
	});
}