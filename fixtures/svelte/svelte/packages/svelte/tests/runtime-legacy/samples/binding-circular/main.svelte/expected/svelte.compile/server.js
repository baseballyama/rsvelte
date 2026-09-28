import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let obj = {};

	obj.self = obj;

	let selected = obj;

	$$renderer.select({ value: selected }, ($$renderer) => {
		$$renderer.option({ value: obj }, ($$renderer) => {
			$$renderer.push(`wheeee`);
		});
	});
}