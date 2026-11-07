import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { name, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<!---->${$.escape(rest.name)} ${$.escape('name' in rest)}`);
	});
}