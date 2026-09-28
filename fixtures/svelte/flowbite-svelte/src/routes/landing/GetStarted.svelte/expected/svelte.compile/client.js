import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/buttons/Button.svelte";
import CopyCliboardInput from "../utils/CopyCliboardInput.svelte";
import ArrowRight from "../utils/icons/ArrowRight.svelte";
import Section from "./utils/Section.svelte";

var root = $.from_html(`See our docs <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col items-center gap-4"><div class="flex-start flex flex-col gap-4"><h2 class="text-center text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl dark:text-white">Get started</h2> <p class="max-w-2xl text-center text-lg">Explore our Svelte UI components – easily create clean, accessible web designs. Begin your journey and enhance your projects today.</p></div> <div class="sm:justify-start1 mt-4 w-full justify-center sm:flex md:mt-5"><div class="mx-0 flex max-w-2xl flex-col items-center gap-4 sm:flex-row sm:gap-6"><!> <!></div></div></div>`);

export default function GetStarted($$anchor) {
	Section($$anchor, {
		tinted: true,
		class: 'lg:py-24',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var div_1 = $.sibling($.child(div), 2);
			var div_2 = $.child(div_1);
			var node = $.child(div_2);

			CopyCliboardInput(node, { class: 'bg-white md:w-80!' });

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				size: 'lg',
				class: 'hover:bg-primary-800 w-full gap-2 whitespace-nowrap sm:max-w-sm md:w-fit',
				href: '/docs/components/accordion',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_1 = root();
					var node_2 = $.sibling($.first_child(fragment_1));

					ArrowRight(node_2, {});
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}