import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			a,
			b = true,
			c = 1,
			d = '',
			e = null,
			f = {},
			g = foo,
			h = [],
			i = undefined,
			j = void 0,
			k = 1,
			l = () => {}
		} = $$props;

		$.bind_props($$props, { j, k });
	});
}