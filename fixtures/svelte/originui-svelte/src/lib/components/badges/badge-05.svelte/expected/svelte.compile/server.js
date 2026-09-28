import * as $ from 'svelte/internal/server';
import { badgeVariants } from '$lib/components/ui/badge.svelte';
import { cn } from '$lib/utils';

export default function Badge_05($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<a href="#title"${$.attr_class($.clsx(cn(badgeVariants({ variant: 'default' }), 'hover:bg-primary/80')))}>Link</a>`);
	});
}