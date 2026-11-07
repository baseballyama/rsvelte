import * as $ from 'svelte/internal/server';
import { Spinner } from "flowbite-svelte";

export default function Type($$renderer) {
	Spinner($$renderer, { type: 'default', color: 'primary' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { type: 'dots', color: 'emerald' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { type: 'bars', color: 'blue' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { type: 'orbit', color: 'rose' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { type: 'pulse', color: 'green' });
	$$renderer.push(`<!---->`);
}