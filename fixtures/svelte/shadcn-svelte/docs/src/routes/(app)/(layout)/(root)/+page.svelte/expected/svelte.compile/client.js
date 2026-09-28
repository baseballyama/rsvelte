import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconArrowRight } from "@tabler/icons-svelte";
import Announcement from "$lib/components/announcement.svelte";
import Metadata from "$lib/components/metadata.svelte";
import PageActions from "$lib/components/page-header/page-actions.svelte";
import PageHeaderDescription from "$lib/components/page-header/page-header-description.svelte";
import PageHeaderHeading from "$lib/components/page-header/page-header-heading.svelte";
import PageHeader from "$lib/components/page-header/page-header.svelte";
import Button from "$lib/registry/ui/button/button.svelte";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import CardsDemo from "./cards/cards-demo.svelte";

var root = $.from_html(`Build Your Own <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<section class="hidden md:block"><div class="style-rhea base-color-neutral theme-neutral" style="--radius: 0.625rem; font-family: 'Inter Variable', sans-serif;"><!></div></section>`);
var root_3 = $.from_html(`<!> <div class="flex flex-1 flex-col"><!> <div class="container-wrapper flex-1 p-0"><div class="container overflow-hidden md:px-0 lg:max-w-none"><section class="-mx-4 w-[140vw] overflow-hidden md:hidden"><enhanced:img src="../../../../../static/img/registry/full-light.png" width="2560" height="2764" alt="Dashboard" class="block h-auto w-full dark:hidden" fetchpriority="high"></enhanced:img> <enhanced:img src="../../../../../static/img/registry/full-dark.png" width="2560" height="2764" alt="Dashboard" class="hidden h-auto w-full dark:block" fetchpriority="high"></enhanced:img></section> <!></div></div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const title = "The Foundation for your Design System";
	const description = "A set of beautifully designed components that you can customize, extend, and build on. Start here then make it your own. Open Source. Open Code.";
	const mobile = new IsMobile();
	var fragment = root_3();
	var node = $.first_child(fragment);

	Metadata(node, { title, description });

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	PageHeader(node_1, {
		class: 'md:**:[.container]:pb-8 lg:**:[.container]:pb-12',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			Announcement(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			PageHeaderHeading(node_3, {
				class: 'max-w-4xl',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					text.nodeValue = 'The Foundation for your Design System';
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			PageHeaderDescription(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					text_1.nodeValue = 'A set of beautifully designed components that you can customize, extend, and build on. Start here then make it your own. Open Source. Open Code.';
					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			PageActions(node_5, {
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						href: '/create?preset=b27GcrRo',
						class: 'h-[31px] rounded-lg',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_5 = root();
							var node_6 = $.sibling($.first_child(fragment_5));

							IconArrowRight(node_6, { 'data-icon': 'inline-end' });
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node_1, 2);
	var div_2 = $.child(div_1);
	var section = $.child(div_2);
	var enhanced_img = $.child(section);
	var enhanced_img_1 = $.sibling(enhanced_img, 2);

	$.reset(section);

	var node_7 = $.sibling(section, 2);

	{
		var consequent = ($$anchor) => {
			var section_1 = root_2();
			var div_3 = $.child(section_1);
			var node_8 = $.child(div_3);

			CardsDemo(node_8, {});
			$.reset(div_3);
			$.reset(section_1);
			$.append($$anchor, section_1);
		};

		$.if(node_7, ($$render) => {
			if (!mobile.current) $$render(consequent);
		});
	}

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(enhanced_img, 'loading', mobile.current ? "eager" : "lazy");
		$.set_attribute(enhanced_img_1, 'loading', mobile.current ? "eager" : "lazy");
	});

	$.append($$anchor, fragment);
	$.pop();
}