import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import { Separator } from "$lib/components/ui/separator/index.js";
import * as Sidebar from "$lib/components/ui/sidebar/index.js";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<header class="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"><div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6"><!> <!> <h1 class="text-base font-medium"> </h1> <div class="ms-auto flex items-center gap-2"><!> <!></div></div></header>`);

export default function Site_header($$anchor, $$props) {
	$.push($$props, true);

	let title = $.prop($$props, 'title', 3, "");
	var header = root();
	var div = $.child(header);
	var node = $.child(div);

	$.component(node, () => Sidebar.Trigger, ($$anchor, Sidebar_Trigger) => {
		Sidebar_Trigger($$anchor, { class: '-ms-1' });
	});

	var node_1 = $.sibling(node, 2);

	Separator(node_1, {
		orientation: 'vertical',
		class: 'mx-2 data-[orientation=vertical]:h-4'
	});

	var h1 = $.sibling(node_1, 2);
	var text = $.only_child(h1, true);
	var div_1 = $.sibling(h1, 2);
	var node_2 = $.child(div_1);

	{
		let $0 = $.derived(() => clientResolver(resolve, "/"));

		Button(node_2, {
			get href() {
				return $.get($0);
			},
			variant: 'secondary',
			size: 'sm',
			target: '_blank',
			rel: 'noopener noreferrer',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Status Page');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		href: 'https://kener.ing/docs',
		variant: 'secondary',
		size: 'sm',
		target: '_blank',
		rel: 'noopener noreferrer',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Documentation');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(header);
	$.template_effect(() => $.set_text(text, title()));
	$.append($$anchor, header);
	$.pop();
}