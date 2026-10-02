import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { badgeVariants } from '$lib/components/ui/badge.svelte';
import { cn } from '$lib/utils';

var root = $.from_html(`<a href="#title">Link</a>`);

export default function Badge_05($$anchor, $$props) {
	$.push($$props, true);

	var a = root();

	$.template_effect(($0) => $.set_class(a, 1, $0), [
		() => $.clsx(cn(badgeVariants({ variant: 'default' }), 'hover:bg-primary/80'))
	]);

	$.append($$anchor, a);
	$.pop();
}