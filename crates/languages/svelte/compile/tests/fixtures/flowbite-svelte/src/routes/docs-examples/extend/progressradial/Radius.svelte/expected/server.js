import * as $ from 'svelte/internal/server';
import { Progressradial } from "flowbite-svelte";

export default function Radius($$renderer) {
	Progressradial($$renderer, { radius: 10 });
	$$renderer.push(`<!----> `);
	Progressradial($$renderer, { radius: 15 });
	$$renderer.push(`<!----> `);
	Progressradial($$renderer, { radius: 20 });
	$$renderer.push(`<!----> `);
	Progressradial($$renderer, { radius: 25 });
	$$renderer.push(`<!---->`);
}