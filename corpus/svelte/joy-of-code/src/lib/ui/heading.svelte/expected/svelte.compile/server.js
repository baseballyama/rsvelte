import * as $ from 'svelte/internal/server';

export default function Heading($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;

		$$renderer.push(`<h1 class="svelte-qy2nrw">`);
		props.children?.($$renderer);
		$$renderer.push(`<!----></h1>`);
	});
}