import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.await($$renderer, Promise.resolve(''), () => {}, (v) => {
		$$renderer.push(`${$.escape(v)}`);
	});

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, Promise.resolve(''), () => {}, () => {
		$$renderer.push(`${$.escape(v)}`);
	});

	$$renderer.push(`<!--]--> `);
	$.await($$renderer, Promise.reject(''), () => {}, () => {});
	$$renderer.push(`<!--]--> `);
	$.await($$renderer, Promise.reject(''), () => {}, () => {});
	$$renderer.push(`<!--]-->`);
}