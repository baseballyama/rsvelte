import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.await(
		$$renderer,
		thePromise,
		() => {
			$$renderer.push(`<p>loading...</p>`);
		},
		(theValue) => {
			$$renderer.push(`<p>the value is ${$.escape(theValue)}</p>`);
		}
	);

	$$renderer.push(`<!--]-->`);
}