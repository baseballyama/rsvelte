import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Avatar from "$lib/avatar/Avatar.svelte";
import Tooltip from "$lib/tooltip/Tooltip.svelte";
import { ChevronRightOutline } from "flowbite-svelte-icons";
import Community from "../utils/icons/Community.svelte";
import Section from "./utils/Section.svelte";

var root = $.from_html(`<a rel="nofollow noreferrer" target="_blank"><!></a>`);
var root_1 = $.from_html(`<div class="mx-auto flex w-full max-w-screen-xl flex-col items-center gap-12"><div class="flex max-w-2xl flex-col items-center justify-center gap-4"><h2 class="text-center text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl dark:text-white">Community contributors</h2> <p class="text-center text-lg font-normal">Join the open-source community by contributing to the Flowbite Svelte Library and become one of the highlighted members</p></div> <div class="flex max-w-5xl flex-col gap-3 px-4 lg:px-8"><div class="flex flex-wrap items-center justify-center gap-3"><!></div> <!></div> <div class="flex w-full max-w-5xl flex-row items-center justify-between lg:px-4"><div class="flex w-full flex-col items-start justify-between gap-4 rounded-lg bg-gray-50 p-4 sm:flex-row sm:items-center sm:gap-8 dark:bg-gray-800"><div class="hidden lg:block lg:w-fit"><!></div> <div class="flex w-full flex-col"><h2 class="text-left text-xl font-bold tracking-tight text-gray-900 dark:text-white">Join the community</h2> <p>Become a member of a community of developers supporting by Flowbite</p></div> <a class="text-primary-700 flex items-center gap-2 text-base font-medium whitespace-nowrap hover:underline" href="http://github.com/themesberg/flowbite-svelte">See our repository <!></a></div></div></div>`);

export default function Contributors($$anchor, $$props) {
	$.push($$props, true);

	let name = $.state("");

	/* eslint-disable  @typescript-eslint/no-explicit-any */
	function on_show(e) {
		if (e?.trigger instanceof HTMLElement) {
			$.set(name, e?.trigger?.dataset.name ?? "", true);
		}
	}

	Section($$anchor, {
		class: 'lg:py-24',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var div_1 = $.sibling($.child(div), 2);
			var div_2 = $.child(div_1);
			var node = $.child(div_2);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.each(node_1, 17, () => $$props.data?.contributors || [], $.index, ($$anchor, contributor) => {
						var a = root();
						var node_2 = $.child(a);

						Avatar(node_2, {
							get 'data-name'() {
								return $.get(contributor).login;
							},

							get src() {
								return $.get(contributor).avatar_url;
							},
							class: 'h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16'
						});

						$.reset(a);
						$.template_effect(() => $.set_attribute(a, 'href', $.get(contributor).html_url));
						$.append($$anchor, a);
					});

					$.append($$anchor, fragment_1);
				};

				$.if(node, ($$render) => {
					if ($$props.data?.contributors) $$render(consequent);
				});
			}

			$.reset(div_2);

			var node_3 = $.sibling(div_2, 2);

			Tooltip(node_3, {
				triggeredBy: '[data-name]',
				ontoggle: on_show,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(name)));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_3 = $.sibling(div_1, 2);
			var div_4 = $.child(div_3);
			var div_5 = $.child(div_4);
			var node_4 = $.child(div_5);

			Community(node_4, {});
			$.reset(div_5);

			var a_1 = $.sibling(div_5, 4);
			var node_5 = $.sibling($.child(a_1));

			ChevronRightOutline(node_5, { class: 'h-6 w-6' });
			$.reset(a_1);
			$.reset(div_4);
			$.reset(div_3);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}