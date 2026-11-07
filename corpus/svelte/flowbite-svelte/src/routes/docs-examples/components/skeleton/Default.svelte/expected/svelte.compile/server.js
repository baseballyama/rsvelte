import * as $ from 'svelte/internal/server';
import { Skeleton } from "flowbite-svelte";

export default function Default($$renderer) {
	Skeleton($$renderer, { size: 'sm', class: 'my-8' });
	$$renderer.push(`<!----> `);
	Skeleton($$renderer, { size: 'md', class: 'my-8' });
	$$renderer.push(`<!----> `);
	Skeleton($$renderer, { size: 'lg', class: 'my-8' });
	$$renderer.push(`<!----> `);
	Skeleton($$renderer, { size: 'xl', class: 'my-8' });
	$$renderer.push(`<!----> `);
	Skeleton($$renderer, { size: '2xl', class: 'mt-8 mb-2.5' });
	$$renderer.push(`<!---->`);
}