import * as $ from 'svelte/internal/server';
import { Spinner } from "flowbite-svelte";

export default function Sizes($$renderer) {
	Spinner($$renderer, { size: '4' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { size: '6' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { size: '8' });
	$$renderer.push(`<!---->`);
}