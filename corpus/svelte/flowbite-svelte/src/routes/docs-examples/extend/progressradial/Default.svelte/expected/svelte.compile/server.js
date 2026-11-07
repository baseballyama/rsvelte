import * as $ from 'svelte/internal/server';
import { Progressradial } from "flowbite-svelte";

export default function Default($$renderer) {
	Progressradial($$renderer, { progress: 20 });
	$$renderer.push(`<!----> `);
	Progressradial($$renderer, { progress: '40' });
	$$renderer.push(`<!----> `);
	Progressradial($$renderer, { progress: 65 });
	$$renderer.push(`<!----> `);
	Progressradial($$renderer, { progress: '83' });
	$$renderer.push(`<!---->`);
}