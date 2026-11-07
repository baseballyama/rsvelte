import * as $ from 'svelte/internal/server';
import { Progressradial } from "flowbite-svelte";

export default function Size($$renderer) {
	Progressradial($$renderer, { size: 'w-20 h-20' });
	$$renderer.push(`<!----> `);
	Progressradial($$renderer, { size: 'w-28 h-28' });
	$$renderer.push(`<!----> `);
	Progressradial($$renderer, { size: 'w-32 h-32' });
	$$renderer.push(`<!----> `);
	Progressradial($$renderer, { size: 'w-40 h-40' });
	$$renderer.push(`<!---->`);
}