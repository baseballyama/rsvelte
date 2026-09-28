import * as $ from 'svelte/internal/server';
import { CardPlaceholder } from "flowbite-svelte";

export default function Card($$renderer) {
	CardPlaceholder($$renderer, {});
	$$renderer.push(`<!----> `);
	CardPlaceholder($$renderer, { size: 'md', class: 'mt-8' });
	$$renderer.push(`<!----> `);
	CardPlaceholder($$renderer, { size: 'lg', class: 'mt-8' });
	$$renderer.push(`<!----> `);
	CardPlaceholder($$renderer, { size: 'xl', class: 'mt-8' });
	$$renderer.push(`<!----> `);
	CardPlaceholder($$renderer, { size: '2xl', class: 'mt-8' });
	$$renderer.push(`<!---->`);
}