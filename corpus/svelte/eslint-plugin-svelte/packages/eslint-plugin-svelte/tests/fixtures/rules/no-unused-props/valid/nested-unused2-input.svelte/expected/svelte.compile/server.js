import * as $ from 'svelte/internal/server';

export default function Nested_unused2_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Won't be reported as unused
		let { user } = $$props;

		console.log(user.name);
	});
}