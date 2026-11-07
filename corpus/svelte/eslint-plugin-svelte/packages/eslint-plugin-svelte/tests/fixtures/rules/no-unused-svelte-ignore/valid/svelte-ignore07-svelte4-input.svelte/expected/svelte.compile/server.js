import * as $ from 'svelte/internal/server';

export default function Svelte_ignore07_svelte4_input($$renderer) {
	$$renderer.push(`<div>`);

	$.await(
		$$renderer,
		Promise.resolve(42),
		() => {
			$$renderer.push(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`);
		},
		() => {}
	);

	$$renderer.push(`<!--]--></div> <div>`);

	$.await(
		$$renderer,
		Promise.resolve(42),
		() => {
			$$renderer.push(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`);
		},
		(name) => {
			$$renderer.push(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`);
		}
	);

	$$renderer.push(`<!--]--></div> <div>`);

	$.await(
		$$renderer,
		Promise.resolve(42),
		() => {
			$$renderer.push(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`);
		},
		(name) => {
			$$renderer.push(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`);
		}
	);

	$$renderer.push(`<!--]--></div> <div>`);

	$.await($$renderer, Promise.resolve(42), () => {}, (n) => {
		$$renderer.push(`<label tabindex="0">Click</label> <ul tabindex="0"></ul>`);
	});

	$$renderer.push(`<!--]--></div> <div>`);
	$.await($$renderer, Promise.resolve(42), () => {}, () => {});
	$$renderer.push(`<!--]--></div>`);
}