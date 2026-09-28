import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Link from "$lib/icons/link.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'href', 'children']);
var root = $.from_html(`<a><h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize"><div class="absolute top-[8px] left-0 opacity-0 outline-hidden group-hover:opacity-100"><div class="h-4 w-4"><!></div></div> <!></h2></a>`);

export default function LinkH2($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);

	// id for page navigation
	const id = $$props.href.split("#").pop();

	var a = root();

	$.attribute_effect(a, () => ({
		href: $$props.href,
		id,
		class: 'group focus-visible:outline-kui-light-primary dark:focus-visible:outline-kui-dark-primary relative -ml-5 inline-block pl-5 no-underline outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2',
		...rest
	}));

	var h2 = $.child(a);
	var div = $.child(h2);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Link(node, {});
	$.reset(div_1);
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	$.snippet(node_1, () => $$props.children);
	$.reset(h2);
	$.reset(a);
	$.append($$anchor, a);
	$.pop();
}