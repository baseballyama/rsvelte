import * as $ from 'svelte/internal/server';
import { Snippet } from '$lib/components/ui/snippet';

export default function Snippet_variants($$renderer) {
	$$renderer.push(`<div class="flex w-full max-w-[300px] flex-col gap-2">`);
	Snippet($$renderer, { text: 'npx jsrepo add ui/snippet' });
	$$renderer.push(`<!----> `);
	Snippet($$renderer, { variant: 'primary', text: 'npx jsrepo add ui/snippet' });
	$$renderer.push(`<!----> `);
	Snippet($$renderer, { variant: 'secondary', text: 'npx jsrepo add ui/snippet' });
	$$renderer.push(`<!----> `);
	Snippet($$renderer, { variant: 'destructive', text: 'npx jsrepo add ui/snippet' });
	$$renderer.push(`<!----></div>`);
}