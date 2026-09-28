import * as $ from 'svelte/internal/server';

function test($$renderer, text) {
	$$renderer.push(`<text${$.attr('x', 20)}${$.attr('y', 42)}>${$.escape(text)}</text>`);
}

export default function Wrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<text x="0" y="14">outside</text>`);

		if (true) {
			$$renderer.push(`<!--[0--><text x="0" y="26">true</text>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--><!--[-->`);

		const each_array = $.ensure_array_like(Array(2).fill(0));

		for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
			let item = each_array[idx];

			$$renderer.push(`<text${$.attr('x', idx * 10)}${$.attr('y', 42)}>${$.escape(idx)}</text>`);
		}

		$$renderer.push(`<!--]-->${$.html('<text x="0" y="40">html</text>')}`);
		test($$renderer, "snippet");
		$$renderer.push(`<!---->`);
	});
}