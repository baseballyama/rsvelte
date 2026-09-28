import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "bits-ui";
import Search from "./search.svelte";
import { Logo } from "$icons/index.js";
import LightSwitch from "$lib/components/light-switch.svelte";
import MobileNav from "$lib/components/navigation/mobile-nav.svelte";
import { siteConfig } from "$lib/config/index.js";
import Github from "$icons/github.svelte";

var root = $.from_html(`<header class="border-border bg-background/75 sticky top-0 z-50 overflow-x-hidden border-b backdrop-blur-md"><div class="px-4"><div class="flex h-[70px] items-center justify-between gap-3"><div class="flex w-full items-center gap-1.5 md:w-auto"><!> <a href="/" class="focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden ml-2 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 md:mr-[125px]"><!></a> <!></div> <div class="flex items-center justify-end"><!> <!></div></div></div></header>`);

export default function Site_header($$anchor, $$props) {
	$.push($$props, true);

	var header = root();
	var div = $.child(header);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	MobileNav(node, {});

	var a = $.sibling(node, 2);
	var node_1 = $.child(a);

	Logo(node_1, {});
	$.reset(a);

	var node_2 = $.sibling(a, 2);

	Search(node_2, {});
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.child(div_3);

	{
		let $0 = $.derived(() => siteConfig.links?.github);

		$.component(node_3, () => Button.Root, ($$anchor, Button_Root) => {
			Button_Root($$anchor, {
				get href() {
					return $.get($0);
				},
				target: '_blank',
				rel: 'noopener noreferrer',
				'aria-label': 'Light Switch',
				class: 'rounded-input hover:bg-dark-10 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden relative inline-flex h-10 w-10 items-center justify-center px-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
				children: ($$anchor, $$slotProps) => {
					Github($$anchor, { class: 'size-5' });
				},
				$$slots: { default: true }
			});
		});
	}

	var node_4 = $.sibling(node_3, 2);

	LightSwitch(node_4, {});
	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
	$.pop();
}