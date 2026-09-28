import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
import Button from "$lib/components/ui/button/button.svelte";
import Check from "@lucide/svelte/icons/check";

var root = $.from_html(`<!> <span class="mt-2 mb-0.5 block text-2xl font-semibold">$0 / mo</span> <!>`, 1);
var root_1 = $.from_html(`<li class="flex items-center gap-2"><!> </li>`);
var root_2 = $.from_html(`<!> <span class="mt-2 mb-0.5 block text-2xl font-semibold">$19 / mo</span> <!>`, 1);
var root_3 = $.from_html(`<!> <span class="mt-2 mb-0.5 block text-2xl font-semibold">$49 / mo</span> <!>`, 1);
var root_4 = $.from_html(`<div class="grid @4xl:grid-cols-3"><div><!> <div class="border-y px-8 py-4"><!></div> <ul role="list" class="space-y-3 p-8"></ul></div> <div class=" -mx-1 rounded-(--radius) bg-background shadow ring-1 @3xl:mx-0 @3xl:-my-3 dark:border-x"><div class="relative px-1 @3xl:px-0 @3xl:py-3"><!> <div class="-mx-1 border-y px-8 py-4 @3xl:mx-0"><!></div> <ul role="list" class="space-y-3 p-8"></ul></div></div> <div><!> <div class="border-y px-8 py-4"><!></div> <ul role="list" class="space-y-3 p-8"></ul></div></div>`);
var root_5 = $.from_html(`<div class="relative bg-muted py-16 [--color-primary:var(--color-indigo-500)] md:py-32 dark:bg-muted/30"><div class="mx-auto max-w-5xl px-6"><div class="mx-auto max-w-2xl text-center"><h2 class="text-3xl font-bold text-balance md:text-4xl lg:text-5xl">Pricing that scale with your business</h2> <p class="mx-auto mt-4 max-w-xl text-lg text-balance text-muted-foreground">Choose the perfect plan for your needs and start optimizing your workflow today</p></div> <div class="@container relative mt-12 md:mt-20"><!></div></div></div>`);

export default function Two($$anchor) {
	var div = root_5();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var node = $.child(div_2);

	Card(node, {
		class: 'relative mx-auto max-w-sm @4xl:max-w-full',
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_4();
			var div_4 = $.child(div_3);
			var node_1 = $.child(div_4);

			CardHeader(node_1, {
				class: 'p-8',
				children: ($$anchor, $$slotProps) => {
					var fragment = root();
					var node_2 = $.first_child(fragment);

					CardTitle(node_2, {
						class: 'font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Free');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 4);

					CardDescription(node_3, {
						class: 'text-sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Per editor');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});

			var div_5 = $.sibling(node_1, 2);
			var node_4 = $.child(div_5);

			Button(node_4, {
				class: 'w-full',
				variant: 'neutral',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Get Started');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);

			var ul = $.sibling(div_5, 2);

			$.each(
				ul,
				20,
				() => [
					"Basic Analytics Dashboard",
					"5GB Cloud Storage",
					"Email and Chat Support"
				],
				$.index,
				($$anchor, item) => {
					var li = root_1();
					var node_5 = $.child(li);

					Check(node_5, { class: 'size-3 text-primary', strokeWidth: 3.5 });

					var text_3 = $.sibling(node_5);

					$.reset(li);
					$.template_effect(() => $.set_text(text_3, ` ${item ?? ''}`));
					$.append($$anchor, li);
				}
			);

			$.reset(ul);
			$.reset(div_4);

			var div_6 = $.sibling(div_4, 2);
			var div_7 = $.child(div_6);
			var node_6 = $.child(div_7);

			CardHeader(node_6, {
				class: 'p-8',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_2();
					var node_7 = $.first_child(fragment_1);

					CardTitle(node_7, {
						class: 'font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Pro');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 4);

					CardDescription(node_8, {
						class: 'text-sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Per editor');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var div_8 = $.sibling(node_6, 2);
			var node_9 = $.child(div_8);

			Button(node_9, {
				variant: 'mdefault',
				class: 'w-full',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Get Started');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_8);

			var ul_1 = $.sibling(div_8, 2);

			$.each(
				ul_1,
				20,
				() => [
					"Everything in Free Plan",
					"5GB Cloud Storage",
					"Email and Chat Support",
					"Access to Community Forum",
					"Single User Access",
					"Access to Basic Templates",
					"Mobile App Access",
					"1 Custom Report Per Month",
					"Monthly Product Updates",
					"Standard Security Features"
				],
				$.index,
				($$anchor, item) => {
					var li_1 = root_1();
					var node_10 = $.child(li_1);

					Check(node_10, { class: 'size-3 text-primary', strokeWidth: 3.5 });

					var text_7 = $.sibling(node_10);

					$.reset(li_1);
					$.template_effect(() => $.set_text(text_7, ` ${item ?? ''}`));
					$.append($$anchor, li_1);
				}
			);

			$.reset(ul_1);
			$.reset(div_7);
			$.reset(div_6);

			var div_9 = $.sibling(div_6, 2);
			var node_11 = $.child(div_9);

			CardHeader(node_11, {
				class: 'p-8',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_3();
					var node_12 = $.first_child(fragment_2);

					CardTitle(node_12, {
						class: 'font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Pro Plus');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 4);

					CardDescription(node_13, {
						class: 'text-sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Per editor');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var div_10 = $.sibling(node_11, 2);
			var node_14 = $.child(div_10);

			Button(node_14, {
				class: 'w-full',
				variant: 'neutral',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Get Started');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			$.reset(div_10);

			var ul_2 = $.sibling(div_10, 2);

			$.each(
				ul_2,
				20,
				() => [
					"Everything in Pro Plan",
					"5GB Cloud Storage",
					"Email and Chat Support"
				],
				$.index,
				($$anchor, item) => {
					var li_2 = root_1();
					var node_15 = $.child(li_2);

					Check(node_15, { class: 'size-3 text-primary', strokeWidth: 3.5 });

					var text_11 = $.sibling(node_15);

					$.reset(li_2);
					$.template_effect(() => $.set_text(text_11, ` ${item ?? ''}`));
					$.append($$anchor, li_2);
				}
			);

			$.reset(ul_2);
			$.reset(div_9);
			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}