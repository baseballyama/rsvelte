import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { bar, 'b-az': baz, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<p>${$.escape(rest.foo)}</p> <p>${$.escape(bar)}</p> <p>${$.escape(baz)}</p>`);
	});
}