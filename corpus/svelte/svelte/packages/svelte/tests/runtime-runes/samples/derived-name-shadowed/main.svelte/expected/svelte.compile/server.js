import * as $ from 'svelte/internal/server';

function foo() {
	const foo = $.derived(() => 42);

	return () => foo();
}

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<!---->${$.escape(foo()())}`);
	});
}