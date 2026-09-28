import * as $ from 'svelte/internal/server';
import { TextPlaceholder } from "flowbite-svelte";

export default function Text($$renderer) {
	TextPlaceholder($$renderer, {});
	$$renderer.push(`<!----> `);
	TextPlaceholder($$renderer, { size: 'md', class: 'mt-8' });
	$$renderer.push(`<!----> `);
	TextPlaceholder($$renderer, { size: 'lg', class: 'mt-8' });
	$$renderer.push(`<!----> `);
	TextPlaceholder($$renderer, { size: 'xl', class: 'mt-8' });
	$$renderer.push(`<!----> `);
	TextPlaceholder($$renderer, { size: '2xl', class: 'mt-8' });
	$$renderer.push(`<!---->`);
}