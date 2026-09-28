import * as $ from 'svelte/internal/server';
import { Progressradial } from "flowbite-svelte";

export default function StartingPosition($$renderer) {
	Progressradial($$renderer, {});
	$$renderer.push(`<!----> `);
	Progressradial($$renderer, { progress: 50, startingPosition: 'right' });
	$$renderer.push(`<!----> `);
	Progressradial($$renderer, { progress: 50, startingPosition: 'bottom' });
	$$renderer.push(`<!----> `);
	Progressradial($$renderer, { progress: 50, startingPosition: 'left' });
	$$renderer.push(`<!---->`);
}