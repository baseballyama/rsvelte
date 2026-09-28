import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';

export default function Input_31($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="group relative"><label${$.attr('for', uid)} class="bg-background text-foreground absolute start-1 top-0 z-10 block -translate-y-1/2 px-2 text-xs font-medium group-has-disabled:opacity-50">Input with overlapping label</label> `);
	Input($$renderer, { id: uid, class: 'h-10', placeholder: 'Email', type: 'email' });
	$$renderer.push(`<!----></div>`);
}