import * as $ from 'svelte/internal/server';
import { Avatar } from "flowbite-svelte";

export default function Placeholder($$renderer) {
	Avatar($$renderer, {});
	$$renderer.push(`<!----> `);
	Avatar($$renderer, { cornerStyle: 'rounded' });
	$$renderer.push(`<!----> `);
	Avatar($$renderer, { border: true });
	$$renderer.push(`<!----> `);
	Avatar($$renderer, { cornerStyle: 'rounded', border: true });
	$$renderer.push(`<!---->`);
}