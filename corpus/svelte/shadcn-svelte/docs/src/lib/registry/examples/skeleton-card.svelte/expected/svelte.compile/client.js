import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

var root = $.from_html(`<div class="flex flex-col space-y-3"><!> <div class="space-y-2"><!> <!></div></div>`);

export default function Skeleton_card($$anchor) {
	var div = root();
	var node = $.child(div);

	Skeleton(node, { class: 'h-[125px] w-[250px] rounded-xl' });

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Skeleton(node_1, { class: 'h-4 w-[250px]' });

	var node_2 = $.sibling(node_1, 2);

	Skeleton(node_2, { class: 'h-4 w-[200px]' });
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}