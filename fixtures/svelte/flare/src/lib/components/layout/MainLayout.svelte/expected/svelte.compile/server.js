import * as $ from 'svelte/internal/server';

export default function MainLayout($$renderer, $$props) {
	let { header, content, footer } = $$props;

	$$renderer.push(`<main class="bg-background text-foreground flex h-screen flex-col">`);
	header($$renderer);
	$$renderer.push(`<!----> `);
	content($$renderer);
	$$renderer.push(`<!----> `);
	footer($$renderer);
	$$renderer.push(`<!----></main>`);
}