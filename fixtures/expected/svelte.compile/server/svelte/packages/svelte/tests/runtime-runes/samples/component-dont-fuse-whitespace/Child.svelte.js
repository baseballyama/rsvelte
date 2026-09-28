import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	const { children } = $$props;

	$$renderer.push(`<p>text before the render tag `);
	children($$renderer);
	$$renderer.push(`<!----></p>`);
}