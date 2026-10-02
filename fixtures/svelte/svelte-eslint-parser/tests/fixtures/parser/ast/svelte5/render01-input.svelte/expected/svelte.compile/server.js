import * as $ from 'svelte/internal/server';

export default function Render01_input($$renderer, $$props) {
	const { foo } = $$props;

	function bar() {
		return "baz";
	}

	foo($$renderer, bar());
	$$renderer.push(`<!---->`);
}