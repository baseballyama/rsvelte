import * as $ from 'svelte/internal/server';

export default function Render02_optional_input($$renderer, $$props) {
	const { foo } = $$props;

	foo?.($$renderer);
	$$renderer.push(`<!---->`);
}