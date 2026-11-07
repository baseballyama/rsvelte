import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, card, Button, Toggle, Label, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions</h5> <p class="leading-tight font-normal text-gray-700 dark:text-gray-300">Here are the biggest enterprise technology acquisitions of so far, in reverse chronological order.</p>`, 1);
var root_1 = $.from_html(`<div class="flex justify-center"><!></div> <div class="my-4 flex flex-wrap space-x-4"><!> <!></div> <div class="flex flex-wrap space-x-2"><!> <!></div> <div class="my-4 flex flex-wrap space-x-4"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!> <!> <!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	const binding_group_2 = [];

	// MetaTag
	let breadcrumb_title = "Card builder";

	let description = "A quick way to create Card component";
	let title = "Card builder";
	let dir = "builder";
	let reverse = $.state(false);
	const sizes = Object.keys(card.variants.size);
	let cardSize = $.state("sm");
	const colors = Object.keys(card.variants.color);
	let color = $.state("gray");
	const shadows = Object.keys(card.variants.shadow);
	let cardShadow = $.state("md");
	let horizontal = $.state(false);

	const changeImgLayout = () => {
		$.set(horizontal, !$.get(horizontal));
	};

	let link = $.state("");

	const changeLink = () => {
		$.set(link, $.get(link) === "" ? "/" : "", true);
	};

	let cardClass = $.state("");

	const changeClass = () => {
		$.set(cardClass, $.get(cardClass) === "" ? "pl-10" : "", true);
	};

	let cardImage = $.state(undefined);

	const changeImage = () => {
		$.set(
			cardImage,
			!$.get(cardImage)
				? { src: "/images/image-1.webp", alt: "my image" }
				: undefined,
			true
		);
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(cardSize) !== "sm") props.push(` size="${$.get(cardSize)}"`);
		if ($.get(color) !== "gray") props.push(` color="${$.get(color)}"`);
		if ($.get(cardShadow) !== "md") props.push(` shadow="${$.get(cardShadow)}"`);
		if ($.get(cardClass)) props.push(` class="${$.get(cardClass)}"`);
		if ($.get(link)) props.push(` href="${$.get(link)}"`);
		if ($.get(horizontal)) props.push(` horizontal`);
		if ($.get(reverse)) props.push(` reverse`);

		if ($.get(cardImage) && typeof $.get(cardImage) === "object") {
			props.push(` img=${$.get(cardImage).src}`);
		}

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Card${propsString}>My Card</Card>`;
	})());

	// for interactive builder
	let builder = uiHelpers();

	let builderExpand = $.state(false);
	let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow($.get(generatedCode)));

	const handleBuilderExpandClick = () => {
		$.set(builderExpand, !$.get(builderExpand));
	};

	// end of DynamicCodeBlock setup
	$.user_effect(() => {
		$.set(builderExpand, builder.isOpen, true);
	});

	// helper function
	const hasImageContent = (img) => {
		return !!img && !!img.src;
	};

	var fragment = root_2();
	var node = $.first_child(fragment);

	H1(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Card Builder');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	MetaTag(node_1, { breadcrumb_title, description, title, dir });

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
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var div = $.first_child(fragment_2);
				var node_3 = $.child(div);

				{
					let $0 = $.derived(() => $.get(link) ? $.get(link) : "");
					let $1 = $.derived(() => $.get(cardImage)?.src);

					Card(node_3, {
						get size() {
							return $.get(cardSize);
						},

						get color() {
							return $.get(color);
						},

						get shadow() {
							return $.get(cardShadow);
						},

						get href() {
							return $.get($0);
						},

						get class() {
							return $.get(cardClass);
						},

						get img() {
							return $.get($1);
						},

						get horizontal() {
							return $.get(horizontal);
						},

						get reverse() {
							return $.get(reverse);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();

							$.next(2);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				}

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_4 = $.child(div_1);

				Label(node_4, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Size');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				$.each(node_5, 17, () => sizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-16" },
						name: 'interactive_card_size',
						get value() {
							return $.get(size);
						},

						get group() {
							return $.get(cardSize);
						},

						set group($$value) {
							$.set(cardSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(size)));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_6 = $.child(div_2);

				Label(node_6, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Color');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				$.each(node_7, 17, () => colors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'alert_reactive',
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

							var text_4 = $.text();

							$.template_effect(() => $.set_text(text_4, $.get(colorOption)));
							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_8 = $.child(div_3);

				Label(node_8, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Shadow');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				$.each(node_9, 17, () => shadows, $.index, ($$anchor, shadow) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-16" },
						name: 'interactive_card_shadow',
						get value() {
							return $.get(shadow);
						},

						get group() {
							return $.get(cardShadow);
						},

						set group($$value) {
							$.set(cardShadow, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text();

							$.template_effect(() => $.set_text(text_6, $.get(shadow)));
							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_10 = $.child(div_4);

				Button(node_10, {
					class: 'w-40',
					color: 'sky',
					onclick: changeLink,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, $.get(link) === "" ? "Add link" : "Remove link"));
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				Button(node_11, {
					class: 'w-40',
					color: 'green',
					onclick: changeClass,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(cardClass) ? "Remove class" : "Add class"));
						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				var node_12 = $.sibling(node_11, 2);

				Button(node_12, {
					class: 'w-40',
					color: 'blue',
					onclick: changeImage,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text();

						$.template_effect(($0) => $.set_text(text_9, $0), [
							() => hasImageContent($.get(cardImage)) ? "Remove image" : "Add image"
						]);

						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				{
					let $0 = $.derived(() => !hasImageContent($.get(cardImage)));

					Button(node_13, {
						get disabled() {
							return $.get($0);
						},
						class: 'w-40',
						color: 'violet',
						onclick: changeImgLayout,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text();

							$.template_effect(() => $.set_text(text_10, $.get(horizontal) ? "Vertical" : "Horizontal"));
							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});
				}

				var node_14 = $.sibling(node_13, 2);

				{
					let $0 = $.derived(() => !hasImageContent($.get(cardImage)) ? 'cursor-not-allowed opacity-50' : '');
					let $1 = $.derived(() => !hasImageContent($.get(cardImage)));

					Toggle(node_14, {
						get class() {
							return `italic dark:text-gray-500 ${$.get($0) ?? ''}`;
						},

						get disabled() {
							return $.get($1);
						},

						get checked() {
							return $.get(reverse);
						},

						set checked($$value) {
							$.set(reverse, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text();

							$.template_effect(() => $.set_text(text_11, `Reverse: ${$.get(reverse) ?? ''}`));
							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});
				}

				$.reset(div_4);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}