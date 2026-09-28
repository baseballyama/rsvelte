import * as $ from 'svelte/internal/server';
import { VideoPlaceholder } from "flowbite-svelte";

export default function Video($$renderer) {
	VideoPlaceholder($$renderer, {});
	$$renderer.push(`<!----> `);
	VideoPlaceholder($$renderer, { size: 'md', class: 'mt-8' });
	$$renderer.push(`<!----> `);
	VideoPlaceholder($$renderer, { size: 'lg', class: 'mt-8' });
	$$renderer.push(`<!----> `);
	VideoPlaceholder($$renderer, { size: 'xl', class: 'mt-8' });
	$$renderer.push(`<!----> `);
	VideoPlaceholder($$renderer, { size: '2xl', class: 'mt-8' });
	$$renderer.push(`<!---->`);
}