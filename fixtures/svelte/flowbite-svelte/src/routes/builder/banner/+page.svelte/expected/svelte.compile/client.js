import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Banner,
	banner,
	Button,
	Skeleton,
	ImagePlaceholder,
	Label,
	Radio,
	uiHelpers
} from "$lib";

import { BullhornOutline } from "flowbite-svelte-icons";
import { blur, fly, slide, scale } from "svelte/transition";
import { linear } from "svelte/easing";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<p class="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400"><span class="me-3 inline-flex rounded-full bg-gray-200 p-1 dark:bg-gray-600"><!> <span class="sr-only">Light bulb</span></span> <span>New brand identity has been launched for the <a href="https://flowbite.com" class="text-primary-600 dark:text-primary-500 inline font-medium decoration-solid decoration-600 dark:decoration-500">Flowbite Library</a></span></p>`);
var root_1 = $.from_html(`<div class="mb-4 h-[670px] md:h-[480px]"><div class="p-6"><!> <!></div> <!></div> <div class="p-6"><div class="mb-4 h-12"><!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];

	// MetaTag
	let breadcrumb_title = "Banner builder";

	let description = "A quick way to create Banner component";
	let title = "Banner builder";
	let dir = "builder";

	// interactive example
	const colors = Object.keys(banner.variants.color);

	let color = $.state("primary");
	let bannerClass = "absolute";
	let bannerStatus = $.state(true);

	const changeStatus = () => {
		$.set(bannerStatus, true);
	};

	// transition
	const transitions = [
		{
			name: "Fly",
			transition: fly,
			params: { duration: 500, easing: linear, x: 150 }
		},

		{
			name: "Blur",
			transition: blur,
			params: { duration: 500, easing: linear }
		},

		{
			name: "Slide",
			transition: slide,
			params: { duration: 500, easing: linear, x: -150 }
		},

		{
			name: "Scale",
			transition: scale,
			params: { duration: 500, easing: linear }
		}
	];

	let selectedTransition = $.state("Fly");
	let currentTransition = $.derived(() => transitions.find((t) => t.name === $.get(selectedTransition)) || transitions[0]);

	// code generator
	let generatedCode = $.derived(() => (() => {
		// position, bannerType color, class
		let props = [];

		if ($.get(color) !== "primary") props.push(` color="${$.get(color)}"`);
		if (bannerClass) props.push(` class="${bannerClass}"`);
		if (!$.get(bannerStatus)) props.push(" bannerStatus={false}");

		if ($.get(currentTransition) !== transitions[0]) {
			props.push(` transition={${$.get(currentTransition).name.toLowerCase()}}`);

			// Generate params string without quotes and handle functions
			const paramsString = Object.entries($.get(currentTransition).params).map(([key, value]) => {
				if (key === "easing") {
					// For easing, use the name of the easing function
					return `${key}:${value.name || "linear"}`;
				}

				// For other values, just use the literal value
				return `${key}:${value}`;
			}).join(",");

			props.push(` params={{${paramsString}}}`);
		}

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<div class="relative h-40">
  <Banner${propsString}>
    My Banner
  </Banner>
</div>`;
	})());

	// for interactive builder
	let builder = uiHelpers();

	let builderExpand = $.state(false);
	let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow($.get(generatedCode)));

	const handleBuilderExpandClick = () => {
		$.set(builderExpand, !$.get(builderExpand));
	};

	// for DynamicCodeBlock setup for examples section. dynamically adjust the height of the code block based on the svelteCode content.
	// end of DynamicCodeBlock setup
	$.user_effect(() => {
		$.set(builderExpand, builder.isOpen, true);
	});

	var fragment = root_2();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Banner Builder');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const codeblock = ($$anchor) => {
			DynamicCodeBlockHighlight($$anchor, {
				handleExpandClick: handleBuilderExpandClick,
				get expand() {
					return $.get(builderExpand);
				},

				get showExpandButton() {
					return $.get(showBuilderExpandButton);
				},

				get code() {
					return $.get(generatedCode);
				}
			});
		};

		CodeWrapper(node_2, {
			class: 'relative',
			innerClass: 'p-0',
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var div = $.first_child(fragment_2);
				var div_1 = $.child(div);
				var node_3 = $.child(div_1);

				Skeleton(node_3, { class: 'py-4' });

				var node_4 = $.sibling(node_3, 2);

				ImagePlaceholder(node_4, { class: 'py-4' });
				$.reset(div_1);

				var node_5 = $.sibling(div_1, 2);

				Banner(node_5, {
					id: 'sample-banner',
					get color() {
						return $.get(color);
					},
					class: bannerClass,
					get transition() {
						return $.get(currentTransition).transition;
					},

					get params() {
						return $.get(currentTransition).params;
					},

					get open() {
						return $.get(bannerStatus);
					},

					set open($$value) {
						$.set(bannerStatus, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var p = root();
						var span = $.child(p);
						var node_6 = $.child(span);

						BullhornOutline(node_6, { class: 'h-3 w-3 text-gray-500 dark:text-gray-400' });
						$.next(2);
						$.reset(span);
						$.next(2);
						$.reset(p);
						$.append($$anchor, p);
					},
					$$slots: { default: true }
				});

				$.reset(div);

				var div_2 = $.sibling(div, 2);
				var div_3 = $.child(div_2);
				var node_7 = $.child(div_3);

				{
					let $0 = $.derived(() => $.get(bannerStatus) ? true : false);

					Button(node_7, {
						class: 'w-48',
						get disabled() {
							return $.get($0);
						},
						onclick: changeStatus,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Open banner');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				}

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_8 = $.child(div_4);

				Label(node_8, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Color');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				$.each(node_9, 17, () => colors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						classes: { label: "w-24 my-1" },
						name: 'color',
						get color() {
							return $.get(colorOption);
						},

						get value() {
							return $.get(colorOption);
						},

						get group() {
							return $.get(color);
						},

						set group($$value) {
							$.set(color, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text();

							$.template_effect(() => $.set_text(text_3, $.get(colorOption)));
							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_4);

				var div_5 = $.sibling(div_4, 2);
				var node_10 = $.child(div_5);

				Label(node_10, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Transition');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				$.each(node_11, 17, () => transitions, $.index, ($$anchor, transition) => {
					Radio($$anchor, {
						classes: { label: "w-16 my-1" },
						name: 'interactive_transition',
						get value() {
							return $.get(transition).name;
						},

						get group() {
							return $.get(selectedTransition);
						},

						set group($$value) {
							$.set(selectedTransition, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text();

							$.template_effect(() => $.set_text(text_5, $.get(transition).name));
							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_5);
				$.reset(div_2);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}