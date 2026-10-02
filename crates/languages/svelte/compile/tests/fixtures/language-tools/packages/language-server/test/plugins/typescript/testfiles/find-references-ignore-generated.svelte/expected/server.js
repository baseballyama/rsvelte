import * as $ from 'svelte/internal/server';

export default function Find_references_ignore_generated($$renderer) {
	let a = null;
	let promise = Promise.resolve(true);

	if (a) {
		$$renderer.push('<!--[0-->');

		$.await(
			$$renderer,
			promise,
			() => {
				if (typeof a === 'string') {
					$$renderer.push(`<!--[0-->${$.escape(promise)}`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			() => {}
		);

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}