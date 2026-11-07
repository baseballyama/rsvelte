import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArrowRightIcon } from "@lucide/svelte";
import { badgeVariants } from "$lib/registry/ui/badge/index.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<a href="/docs/changelog">Introducing Rhea <!></a>`);

export default function Announcement($$anchor, $$props) {
	$.push($$props, true);

	var a = root();
	var node = $.sibling($.child(a));

	ArrowRightIcon(node, {});
	$.reset(a);

	$.template_effect(($0) => $.set_class(a, 1, $0), [
		() => $.clsx(cn(badgeVariants({ variant: "secondary", class: "bg-muted" })))
	]);

	$.append($$anchor, a);
	$.pop();
}