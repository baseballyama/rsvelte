import * as $ from 'svelte/internal/server';

export default function Regex_conditional($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const value = /[)]/.test("a") ? "a" : "b";
		$$renderer.push(`<p${$.attr_class($.clsx(value), 'svelte-npxfk3')}></p>`);
	});
}
