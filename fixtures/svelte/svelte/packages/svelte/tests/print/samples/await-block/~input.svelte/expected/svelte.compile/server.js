import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.await(
		$$renderer,
		promise,
		() => {
			$$renderer.push(`<p>waiting for the promise to resolve...</p>`);
		},
		(value) => {
			$$renderer.push(`<p>The value is ${$.escape(value)}</p>`);
		}
	);

	$$renderer.push(`<!--]--> `);
	$.await($$renderer, promise, () => {}, () => {});
	$$renderer.push(`<!--]--> `);

	$.await($$renderer, promise, () => {}, (value) => {
		$$renderer.push(`<p>The value is ${$.escape(value)}</p>`);
	});

	$$renderer.push(`<!--]--> `);
	$.await($$renderer, promise, () => {}, () => {});
	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		promise,
		() => {
			$$renderer.push(`<p>waiting for the promise to resolve...</p>`);
		},
		() => {
			$$renderer.push(`<p>the promise resolved</p>`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		promise,
		() => {
			$$renderer.push(`<p>waiting for the promise to resolve...</p>`);
		},
		() => {}
	);

	$$renderer.push(`<!--]-->`);
}