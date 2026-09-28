import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent, CardHeader } from "$lib/components/ui/card";
import Zap from "@lucide/svelte/icons/zap";
import Settings2 from "@lucide/svelte/icons/settings-2";
import Sparkles from "@lucide/svelte/icons/sparkles";
import CardDecorator from "./card-decorator.svelte";

var root = $.from_html(`<!> <h3 class="mt-6 font-medium">Customizable</h3>`, 1);

var root_1 = $.from_html(`<p class="text-sm">Extensive customization options, allowing you to tailor every aspect to meet
						your specific needs.</p>`);

var root_2 = $.from_html(`<!> <h3 class="mt-6 font-medium">You have full control</h3>`, 1);

var root_3 = $.from_html(`<p class="mt-3 text-sm">From design elements to functionality, you have complete control to create a
						unique and personalized experience.</p>`);

var root_4 = $.from_html(`<!> <h3 class="mt-6 font-medium">Powered By AI</h3>`, 1);

var root_5 = $.from_html(`<p class="mt-3 text-sm">Elements to functionality, you have complete control to create a unique
						experience.</p>`);

var root_6 = $.from_html(`<div class="group shadow-zinc-950/5"><!> <!></div> <div class="group shadow-zinc-950/5"><!> <!></div> <div class="group shadow-zinc-950/5"><!> <!></div>`, 1);
var root_7 = $.from_html(`<section class="bg-zinc-50 py-16 md:py-32 dark:bg-transparent"><div class="@container mx-auto max-w-5xl px-6"><div class="text-center"><h2 class="text-4xl font-semibold text-balance lg:text-5xl">Built to cover your needs</h2> <p class="mt-4">Libero sapiente aliquam quibusdam aspernatur, praesentium iusto repellendus.</p></div> <!></div></section>`);

export default function Feature_three($$anchor) {
	var section = root_7();
	var div = $.child(section);
	var node = $.sibling($.child(div), 2);

	Card(node, {
		class: 'mx-auto mt-8 grid max-w-sm divide-y overflow-hidden shadow-zinc-950/5 *:text-center md:mt-16 @min-4xl:max-w-full @min-4xl:grid-cols-3 @min-4xl:divide-x @min-4xl:divide-y-0',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_6();
			var div_1 = $.first_child(fragment);
			var node_1 = $.child(div_1);

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

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_4 = $.child(div_2);

			CardHeader(node_4, {
				class: 'pb-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var node_5 = $.first_child(fragment_3);

					CardDecorator(node_5, {
						children: ($$anchor, $$slotProps) => {
							Settings2($$anchor, { class: 'size-6', 'aria-hidden': true });
						},
						$$slots: { default: true }
					});

					$.next(2);
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			CardContent(node_6, {
				children: ($$anchor, $$slotProps) => {
					var p_1 = root_3();

					$.append($$anchor, p_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_7 = $.child(div_3);

			CardHeader(node_7, {
				class: 'pb-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_4();
					var node_8 = $.first_child(fragment_5);

					CardDecorator(node_8, {
						children: ($$anchor, $$slotProps) => {
							Sparkles($$anchor, { class: 'size-6', 'aria-hidden': true });
						},
						$$slots: { default: true }
					});

					$.next(2);
					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_7, 2);

			CardContent(node_9, {
				children: ($$anchor, $$slotProps) => {
					var p_2 = root_5();

					$.append($$anchor, p_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}