import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import SiteFooter from "$lib/components/site-footer.svelte";
import SiteHeader from "$lib/components/site-header.svelte";

var root = $.from_html(`<div class="relative z-10 flex min-h-svh flex-col bg-background"><!> <main class="flex flex-1 flex-col"><!></main> <!></div>`);

export default function _layout($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	SiteHeader(node, {});

	var main = $.sibling(node, 2);
	var node_1 = $.child(main);

	$.component(node_1, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_2 = $.first_child(fragment);

				$.snippet(node_2, () => $$props.children);
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(main);

	var node_3 = $.sibling(main, 2);

	SiteFooter(node_3, {});
	$.reset(div);
	$.append($$anchor, div);
}