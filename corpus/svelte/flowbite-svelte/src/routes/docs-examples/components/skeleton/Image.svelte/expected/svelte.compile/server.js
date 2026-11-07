import * as $ from 'svelte/internal/server';
import { ImagePlaceholder } from "flowbite-svelte";

export default function Image($$renderer) {
	ImagePlaceholder($$renderer, { size: 'sm' });
	$$renderer.push(`<!----> `);
	ImagePlaceholder($$renderer, { imgOnly: true });
	$$renderer.push(`<!----> `);
	ImagePlaceholder($$renderer, { size: 'md' });
	$$renderer.push(`<!----> `);
	ImagePlaceholder($$renderer, { size: 'lg' });
	$$renderer.push(`<!---->`);
}