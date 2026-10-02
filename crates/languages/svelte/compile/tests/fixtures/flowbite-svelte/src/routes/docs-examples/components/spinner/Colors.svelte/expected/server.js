import * as $ from 'svelte/internal/server';
import { Spinner } from "flowbite-svelte";

export default function Colors($$renderer) {
	Spinner($$renderer, {});
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { color: 'gray' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { color: 'green' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { color: 'red' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { color: 'yellow' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { color: 'pink' });
	$$renderer.push(`<!----> `);
	Spinner($$renderer, { color: 'purple' });
	$$renderer.push(`<!---->`);
}