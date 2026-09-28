import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { promise } = $$props;

	if (promise) {
		$$renderer.push('<!--[0-->');

		$.await(
			$$renderer,
			promise,
			() => {
				$$renderer.push(`${$.escape(console.log("await"))}`);
			},
			(r) => {
				$$renderer.push(`${$.escape(console.log("then:" + r))}`);
			}
		);

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}