import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent, CardHeader } from "$lib/components/ui/card";
import CardDecorator from "./card-decorator.svelte";
import Zap from "@lucide/svelte/icons/zap";
import Settings2 from "@lucide/svelte/icons/settings-2";
import Sparkles from "@lucide/svelte/icons/sparkles";

var root = $.from_html(`<!> <h3 class="mt-6 font-medium">Customizable</h3>`, 1);

var root_1 = $.from_html(`<p class="text-sm">Extensive customization options, allowing you to tailor every aspect to meet
						your specific needs.</p>`);

var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <h3 class="mt-6 font-medium">You have full control</h3>`, 1);

var root_4 = $.from_html(`<p class="mt-3 text-sm">From design elements to functionality, you have complete control to create a
						unique and personalized experience.</p>`);

var root_5 = $.from_html(`<!> <h3 class="mt-6 font-medium">Powered By AI</h3>`, 1);

var root_6 = $.from_html(`<p class="mt-3 text-sm">Elements to functionality, you have complete control to create a unique
						experience.</p>`);

var root_7 = $.from_html(`<section class="bg-zinc-50 py-16 md:py-32 dark:bg-transparent"><div class="@container mx-auto max-w-5xl px-6"><div class="text-center"><h2 class="text-4xl font-semibold text-balance lg:text-5xl">Built to cover your needs</h2> <p class="mt-4">Libero sapiente aliquam quibusdam aspernatur, praesentium iusto repellendus.</p></div> <div class="mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16 @min-4xl:max-w-full @min-4xl:grid-cols-3"><!> <!> <!></div></div></section>`);

export default function Feature_one($$anchor) {
	var section = root_7();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Card(node, {
		class: 'group shadow-zinc-950/5',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			CardHeader(node_1, {
				class: 'pb-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					CardDecorator(node_2, {
						children: ($$anchor, $$slotProps) => {
							Zap($$anchor, { class: 'size-6', 'aria-hidden': true });
						},
						$$slots: { default: true }
					});

					$.next(2);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_1, 2);

			CardContent(node_3, {
				children: ($$anchor, $$slotProps) => {
					var p = root_1();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	Card(node_4, {
		class: 'group shadow-zinc-950/5',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_5 = $.first_child(fragment_3);

			CardHeader(node_5, {
				class: 'pb-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_3();
					var node_6 = $.first_child(fragment_4);

					CardDecorator(node_6, {
						children: ($$anchor, $$slotProps) => {
							Settings2($$anchor, { class: 'size-6', 'aria-hidden': true });
						},
						$$slots: { default: true }
					});

					$.next(2);
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_5, 2);

			CardContent(node_7, {
				children: ($$anchor, $$slotProps) => {
					var p_1 = root_4();

					$.append($$anchor, p_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_4, 2);

	Card(node_8, {
		class: 'group shadow-zinc-950/5',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_2();
			var node_9 = $.first_child(fragment_6);

			CardHeader(node_9, {
				class: 'pb-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_5();
					var node_10 = $.first_child(fragment_7);

					CardDecorator(node_10, {
						children: ($$anchor, $$slotProps) => {
							Sparkles($$anchor, { class: 'size-6', 'aria-hidden': true });
						},
						$$slots: { default: true }
					});

					$.next(2);
					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_9, 2);

			CardContent(node_11, {
				children: ($$anchor, $$slotProps) => {
					var p_2 = root_6();

					$.append($$anchor, p_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}