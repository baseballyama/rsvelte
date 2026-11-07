import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$$renderer.push(`<p id="prerendered-data">${$.escape(data.r1)}
	${$.escape(data.r2)}
	${$.escape(data.r3)}
	${$.escape(data.r4)}</p>`);
	});
}