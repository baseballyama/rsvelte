import * as $ from 'svelte/internal/server';

export default function Custom_config_combination_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { base, my_foo } = $$props;

		console.log(base.age, my_foo.foo, my_foo.bar);
	});
}