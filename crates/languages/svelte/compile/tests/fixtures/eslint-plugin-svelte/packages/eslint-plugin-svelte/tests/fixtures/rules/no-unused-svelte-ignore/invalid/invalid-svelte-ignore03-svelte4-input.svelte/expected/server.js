import * as $ from 'svelte/internal/server';

export default function Invalid_svelte_ignore03_svelte4_input($$renderer) {
	$$renderer.push(`<div>`);

	$.await($$renderer, Promise.resolve(42), () => {}, (name) => {
		$$renderer.push(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`);
	});

	$$renderer.push(`<!--]--></div> <div>`);

	$.await($$renderer, Promise.resolve(42), () => {}, (name) => {
		$$renderer.push(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`);
	});

	$$renderer.push(`<!--]--></div>`);
}