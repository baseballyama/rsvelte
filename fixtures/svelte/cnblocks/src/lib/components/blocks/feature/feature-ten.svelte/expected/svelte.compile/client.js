import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";
import Calendar from "@lucide/svelte/icons/calendar";
import MapIcon from "@lucide/svelte/icons/map";
import FeatureCard from "./feature-card.svelte";
import * as Card from "$lib/components/ui/card/index.js";

const cardHeading = ($$anchor, $$arg0) => {
	let Icon = () => ($$arg0?.()).icon;
	let title = () => ($$arg0?.()).title;
	let description = () => ($$arg0?.()).description;
	var div = root();
	var span = $.child(div);
	var node = $.child(span);

	$.component(node, Icon, ($$anchor, Icon_1) => {
		Icon_1($$anchor, { class: 'size-4' });
	});

	var text = $.sibling(node);

	$.reset(span);

	var p = $.sibling(span, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, ` ${title() ?? ''}`);
		$.set_text(text_1, description());
	});

	$.append($$anchor, div);
};

const dualModeImg = ($$anchor, $$arg0) => {
	let darkSrc = () => ($$arg0?.()).darkSrc;
	let lightSrc = () => ($$arg0?.()).lightSrc;
	let alt = () => ($$arg0?.()).alt;
	let width = () => ($$arg0?.()).width;
	let height = () => ($$arg0?.()).height;
	let _class = () => ($$arg0?.())._class;
	var fragment = root_1();
	var img = $.first_child(fragment);
	var img_1 = $.sibling(img, 2);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(img, 'src', darkSrc());
			$.set_class(img, 1, $0);
			$.set_attribute(img, 'alt', `${alt()} dark`);
			$.set_attribute(img, 'width', width());
			$.set_attribute(img, 'height', height());
			$.set_attribute(img_1, 'src', lightSrc());
			$.set_class(img_1, 1, $1);
			$.set_attribute(img_1, 'alt', `${alt()} light`);
			$.set_attribute(img_1, 'width', width());
			$.set_attribute(img_1, 'height', height());
		},
		[
			() => $.clsx(cn("hidden dark:block", _class())),
			() => $.clsx(cn("shadow dark:hidden", _class()))
		]
	);

	$.append($$anchor, fragment);
};

const circularUI = ($$anchor, $$arg0) => {
	let label = () => ($$arg0?.()).label;
	let circles = () => ($$arg0?.()).circles;
	let _class = () => ($$arg0?.())._class;
	var div_1 = root_3();
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);

	$.each(div_3, 21, circles, $.index, ($$anchor, circle) => {
		var div_4 = root_2();

		$.template_effect(($0) => $.set_class(div_4, 1, $0), [
			() => $.clsx(cn("size-7 rounded-full border sm:size-8", {
				"border-primary": $.get(circle).pattern === "none",
				"border-primary bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_4px)]": $.get(circle).pattern === "border",
				"border-primary bg-background bg-[repeating-linear-gradient(-45deg,var(--color-primary),var(--color-primary)_1px,transparent_1px,transparent_4px)]": $.get(circle).pattern === "primary",
				"z-1 border-blue-500 bg-background bg-[repeating-linear-gradient(-45deg,var(--color-blue-500),var(--color-blue-500)_1px,transparent_1px,transparent_4px)]": $.get(circle).pattern === "blue"
			}))
		]);

		$.append($$anchor, div_4);
	});

	$.reset(div_3);
	$.reset(div_2);

	var span_1 = $.sibling(div_2, 2);
	var text_2 = $.only_child(span_1, true);

	$.reset(div_1);

	$.template_effect(() => {
		$.set_class(div_1, 1, $.clsx(_class()));
		$.set_text(text_2, label());
	});

	$.append($$anchor, div_1);
};

var root = $.from_html(`<div class="p-6"><span class="flex items-center gap-2 text-muted-foreground"><!> </span> <p class="mt-8 text-2xl font-semibold"> </p></div>`);
var root_1 = $.from_html(`<img/> <img/>`, 1);
var root_2 = $.from_html(`<div></div>`);
var root_3 = $.from_html(`<div><div class="size-fit rounded-2xl bg-linear-to-b from-border to-transparent p-px"><div class="relative flex aspect-square w-fit items-center -space-x-4 rounded-[15px] bg-linear-to-b from-background to-muted/25 p-4"></div></div> <span class="mt-1.5 block text-center text-sm text-muted-foreground"> </span></div>`);
var root_4 = $.from_html(`<!> <div class="mb-6 border-t border-dashed sm:mb-0"><div class="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_0%,transparent_40%,var(--color-blue-600),var(--color-white)_100%)]"></div> <div class="aspect-76/59 p-1 px-6"><!></div></div>`, 1);
var root_5 = $.from_html(`<div class="relative mb-6 overflow-hidden sm:mb-0"><div class="absolute -inset-6 [background:radial-gradient(50%_50%_at_75%_50%,transparent,var(--color-background)_100%)]"></div> <div class="aspect-76/59 border"><!></div></div>`);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_html(`<p class="mx-auto my-6 max-w-md text-center text-2xl font-semibold text-balance">Smart scheduling with automated reminders for maintenance.</p> <div class="flex justify-center gap-6 overflow-hidden"><!> <!> <!> <!></div>`, 1);
var root_8 = $.from_html(`<section class="bg-zinc-50 py-16 md:py-32 dark:bg-transparent"><div class="mx-auto max-w-2xl px-6 lg:max-w-5xl"><div class="mx-auto grid gap-4 lg:grid-cols-2"><!> <!> <!></div></div></section>`);

export default function Feature_ten($$anchor, $$props) {
	$.push($$props, true);

	var section = root_8();
	var div_5 = $.child(section);
	var div_6 = $.child(div_5);
	var node_1 = $.child(div_6);

	FeatureCard(node_1, {
		class: 'relative',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node_2 = $.first_child(fragment_1);

			$.component(node_2, () => Card.Header, ($$anchor, Card_Header) => {
				Card_Header($$anchor, {
					class: 'pb-3',
					children: ($$anchor, $$slotProps) => {
						cardHeading($$anchor, () => ({
							icon: MapIcon,
							title: "Real time location tracking",
							description: "Advanced tracking system, Instantly locate all your assets."
						}));
					},
					$$slots: { default: true }
				});
			});

			var div_7 = $.sibling(node_2, 2);
			var div_8 = $.sibling($.child(div_7), 2);
			var node_3 = $.child(div_8);

			dualModeImg(node_3, () => ({
				darkSrc: "/payments.png",
				lightSrc: "/payments-light.png",
				alt: "payments illustration",
				width: 1207,
				height: 929
			}));

			$.reset(div_8);
			$.reset(div_7);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_1, 2);

	FeatureCard(node_4, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_6();
			var node_5 = $.first_child(fragment_3);

			$.component(node_5, () => Card.Header, ($$anchor, Card_Header_1) => {
				Card_Header_1($$anchor, {
					class: 'pb-3',
					children: ($$anchor, $$slotProps) => {
						cardHeading($$anchor, () => ({
							icon: Calendar,
							title: "Advanced Scheduling",
							description: "Scheduling system, Instantly locate all your assets."
						}));
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_5, 2);

			$.component(node_6, () => Card.Content, ($$anchor, Card_Content) => {
				Card_Content($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var div_9 = root_5();
						var div_10 = $.sibling($.child(div_9), 2);
						var node_7 = $.child(div_10);

						dualModeImg(node_7, () => ({
							darkSrc: "/origin-cal-dark.png",
							lightSrc: "/origin-cal.png",
							alt: "calendar illustration",
							width: 1207,
							height: 929
						}));

						$.reset(div_10);
						$.reset(div_9);
						$.append($$anchor, div_9);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_4, 2);

	FeatureCard(node_8, {
		class: 'p-6 lg:col-span-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_7();
			var div_11 = $.sibling($.first_child(fragment_5), 2);
			var node_9 = $.child(div_11);

			circularUI(node_9, () => ({
				label: "Union",
				circles: [{ pattern: "border" }, { pattern: "border" }],
				_class: ""
			}));

			var node_10 = $.sibling(node_9, 2);

			circularUI(node_10, () => ({
				label: "Inclusion",
				circles: [{ pattern: "none" }, { pattern: "primary" }],
				_class: ""
			}));

			var node_11 = $.sibling(node_10, 2);

			circularUI(node_11, () => ({
				label: "Join",
				circles: [{ pattern: "blue" }, { pattern: "none" }],
				_class: ""
			}));

			var node_12 = $.sibling(node_11, 2);

			circularUI(node_12, () => ({
				label: "Exclusion",
				circles: [{ pattern: "primary" }, { pattern: "none" }],
				_class: "hidden sm:block"
			}));

			$.reset(div_11);
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);
	$.reset(div_5);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}