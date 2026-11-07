import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { badgeVariants } from '$lib/components/ui/badge.svelte';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Check from '@lucide/svelte/icons/check';
import { cn } from '$lib/utils';

var root = $.from_html(`<label><div class="flex items-center gap-1"><!> <!> <span class="select-none">Selectable</span></div></label>`);

export default function Badge_11($$anchor, $$props) {
	$.push($$props, true);

	var label = root();
	var div = $.child(label);
	var node = $.child(div);

	Checkbox(node, {
		id: 'badge-selectable',
		class: 'peer sr-only after:absolute after:inset-0',
		checked: true
	});

	var node_1 = $.sibling(node, 2);

	Check(node_1, {
		size: 12,
		class: 'hidden peer-data-[state=checked]:block',
		'aria-hidden': 'true'
	});

	$.next(2);
	$.reset(div);
	$.reset(label);

	$.template_effect(($0) => $.set_class(label, 1, $0), [
		() => $.clsx(cn(badgeVariants({ variant: 'default' }), 'hover:bg-primary/80 has-data-[state=unchecked]:bg-muted has-data-[state=unchecked]:text-muted-foreground has-focus-visible:outline-ring/70 cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-solid'))
	]);

	$.append($$anchor, label);
	$.pop();
}