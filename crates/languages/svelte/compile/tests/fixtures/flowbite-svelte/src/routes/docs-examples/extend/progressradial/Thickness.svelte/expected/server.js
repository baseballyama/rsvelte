import * as $ from 'svelte/internal/server';
import { Progressradial } from "flowbite-svelte";

export default function Thickness($$renderer) {
	Progressradial($$renderer, {});
	$$renderer.push(`<!----> `);
	Progressradial($$renderer, { thickness: 5 });
	$$renderer.push(`<!----> `);
	Progressradial($$renderer, { thickness: 10 });
	$$renderer.push(`<!----> `);
	Progressradial($$renderer, { thickness: 15 });
	$$renderer.push(`<!---->`);
}