import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { css } = $$props;

	$.head('o1e4hf', $$renderer, ($$renderer) => {
		$.element(
			$$renderer,
			'style',
			() => {
				$$renderer.push(` type="text/css"`);
			},
			() => {
				$$renderer.push(`${$.escape(css)}`);
			}
		);
	});

	$$renderer.push(`<p>content</p>`);
}