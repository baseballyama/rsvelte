import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/buttons/Button.svelte";
import ArrowRight from "../utils/icons/ArrowRight.svelte";
import Figma from "../utils/icons/Figma.svelte";
import FlowbiteLogo from "../utils/icons/FlowbiteLogo.svelte";
import Section from "./utils/Section.svelte";

var root = $.from_html(`<!> Preview in Figma <div class="ms-auto hidden sm:block"><!></div>`, 1);
var root_1 = $.from_html(`<!> Learn more <div class="ms-auto hidden sm:block"><!></div>`, 1);
var root_2 = $.from_html(`<div class="grid grid-cols-1 justify-between py-1 lg:grid-cols-2"><div class="flex max-w-lg flex-col gap-8"><div class="flex flex-col items-start gap-6"><h2 class="text-3xl leading-none font-extrabold text-gray-900 lg:text-4xl dark:text-white">Design with Figma</h2> <p class="text-lg">Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software development tools.</p></div> <div class="flex flex-col items-center gap-4"><p class="self-stretch">Our design system is being used by a large number of devs:</p> <div class="max-w-l isolate flex flex-col items-start gap-4 self-stretch"><!> <!></div></div></div> <div class="hidden h-full flex-col items-center justify-center lg:flex"><div class="relative block rounded-xl dark:hidden"><img class="max-w-auto w-full" src="/images/figma.png" alt="Header"/></div> <div class="relative hidden dark:block"><img class="max-w-auto w-full rounded-xl" src="/images/figma-dark.png" alt="Header"/></div></div></div>`);

export default function DesignFigma($$anchor) {
	Section($$anchor, {
		tinted: true,
		class: 'lg:py-24',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var div_1 = $.child(div);
			var div_2 = $.sibling($.child(div_1), 2);
			var div_3 = $.sibling($.child(div_2), 2);
			var node = $.child(div_3);

			Button(node, {
				color: 'light',
				class: 'max-w-lg justify-start! gap-5 self-stretch px-4! sm:gap-7',
				size: 'xl',
				href: 'https://www.figma.com/file/5pHMkriSz9q98zawojb4mx/flowbite-pro-figma-v2.5.0?node-id=18-0&t=X431WUvSP7jsPiEI-0',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					Figma(node_1, {});

					var div_4 = $.sibling(node_1, 2);
					var node_2 = $.child(div_4);

					ArrowRight(node_2, {});
					$.reset(div_4);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			Button(node_3, {
				color: 'light',
				class: 'max-w-lg justify-start! gap-4 self-stretch px-4! sm:gap-6',
				size: 'xl',
				href: 'https://flowbite.com/figma/',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_4 = $.first_child(fragment_2);

					FlowbiteLogo(node_4, {});

					var div_5 = $.sibling(node_4, 2);
					var node_5 = $.child(div_5);

					ArrowRight(node_5, {});
					$.reset(div_5);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.reset(div_2);
			$.reset(div_1);
			$.next(2);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}