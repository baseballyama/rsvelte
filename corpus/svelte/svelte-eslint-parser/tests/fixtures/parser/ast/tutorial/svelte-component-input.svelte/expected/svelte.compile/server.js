import * as $ from 'svelte/internal/server';
import RedThing from './RedThing.svelte';
import GreenThing from './GreenThing.svelte';
import BlueThing from './BlueThing.svelte';

export default function Svelte_component_input($$renderer) {
	const options = [
		{ color: 'red', component: RedThing },
		{ color: 'green', component: GreenThing },
		{ color: 'blue', component: BlueThing }
	];

	let selected = options[0];

	$$renderer.select({ value: selected }, ($$renderer) => {
		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(options);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let option = each_array[$$index];

			$$renderer.option({ value: option }, ($$renderer) => {
				$$renderer.push(`${$.escape(option.color)}`);
			});
		}

		$$renderer.push(`<!--]-->`);
	});

	$$renderer.push(` `);

	if (selected.component) {
		$$renderer.push('<!--[-->');
		selected.component($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}