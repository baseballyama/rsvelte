import * as $ from 'svelte/internal/server';

export default function Custom_config_combination_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { my_foo } = $$props;

		console.log(my_foo.foo);
	});
}