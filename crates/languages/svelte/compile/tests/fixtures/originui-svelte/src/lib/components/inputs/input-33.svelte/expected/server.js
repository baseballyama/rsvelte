import * as $ from 'svelte/internal/server';

export default function Input_33($$renderer) {
	const // If you have a custom Input component, you might want to import it here
	// import Input from '$lib/components/ui/input.svelte';
	uid = $.props_id($$renderer);

	$$renderer.push(`<div class="border-input bg-background ring-offset-background focus-within:border-ring focus-within:ring-ring/30 relative rounded-lg border shadow-xs shadow-black/[.04] transition-shadow focus-within:ring-2 focus-within:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-50 [&amp;:has(input:is(:disabled))_*]:pointer-events-none"><label${$.attr('for', uid)} class="text-foreground block px-3 pt-2 text-xs font-medium">Input with inset label</label> <input${$.attr('id', uid)} class="text-foreground placeholder:text-muted-foreground/70 flex h-10 w-full bg-transparent px-3 pb-2 text-sm focus-visible:outline-hidden" placeholder="Email" type="email"/></div>`);
}