import * as $ from 'svelte/internal/server';

export default function Await($$renderer, $$props) {
	let { promise } = $$props;

	$.await(
		$$renderer,
		promise,
		() => {
			$$renderer.push(`pending`);
		},
		(value) => {
			$$renderer.push(`then ${$.escape(value)}`);
		}
	);

	$$renderer.push(`<!--]-->`);
}