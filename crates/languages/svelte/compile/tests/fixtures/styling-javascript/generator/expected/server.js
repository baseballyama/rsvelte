import * as $ from 'svelte/internal/server';

export default function Generator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function* values() {
			yield "a";
			yield* ["b"];
		}
		const value = values().next().value;
		$$renderer.push(`<p${$.attr_class($.clsx(value), 'svelte-z4nc94')}></p>`);
	});
}
