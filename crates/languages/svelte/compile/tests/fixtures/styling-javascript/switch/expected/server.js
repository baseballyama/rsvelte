import * as $ from 'svelte/internal/server';

export default function Switch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const value = "a";
		function run(x) {
			switch (x) {
				case 1:
					return "a";
				case 2:
					throw new Error("b");
				default:
					return "b";
			}
		}
		$$renderer.push(`<p${$.attr_class($.clsx(run(1)), 'svelte-x4829d')}></p>`);
	});
}
