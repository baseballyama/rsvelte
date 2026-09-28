import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	A,
	Button,
	anchor,
	Label,
	Radio,
	Input,
	CloseButton,
	uiHelpers
} from "$lib";

import { ArrowRightOutline } from "flowbite-svelte-icons";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> <!> <div class="mb-4 md:h-10"><!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// MetaTag
	let breadcrumb_title = "Link builder";

	let description = "A quick way to create Link component";
	let title = "Link builder";
	let dir = "builder";

	// for Props table
	// import CompoAttributesViewer from '../utils/CompoAttributesViewer.svelte';
	let text = $.prop($$props, 'text', 15, "Read more");

	const colors = Object.keys(anchor.variants.color);
	let anchorColor = $.state("primary");
	let linkClass = $.state("font-medium hover:underline");

	const changeLinkClass = () => {
		$.set(
			linkClass,
			$.get(linkClass) === "font-medium hover:underline"
				? "underline hover:no-underline italic font-semibold"
				: "font-medium hover:underline",
			true
		);
	};

	let linkIcon = $.state(false);

	const changeIcon = () => {
		$.set(linkIcon, !$.get(linkIcon));
	};

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];
		let iconSlot;

		props.push(` href="/"`);

		if ($.get(anchorColor) !== "primary") props.push(` color="${$.get(anchorColor)}"`);
		if ($.get(linkClass)) props.push(` class="${$.get(linkClass)}"`);

		iconSlot = $.get(linkIcon) ? `\n  <ArrowRightOutline class="ms-2 h-6 w-6" />` : "";

		// if (imgAlignment !== 'left') props.push(` alignment="${imgAlignment}"`);
		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<A${propsString}>
  ${text()} ${iconSlot}
</A>`;
	})());

	// for interactive builder
	let builder = uiHelpers();

	let builderExpand = $.state(false);
	let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow($.get(generatedCode)));

	const handleBuilderExpandClick = () => {
		$.set(builderExpand, !$.get(builderExpand));
	};

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

			var text_1 = $.text('Link Builder');

			$.append($$anchor, text_1);
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
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var node_3 = $.first_child(fragment_2);

				Label(node_3, {
					class: 'text-md mb-2',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Edit link');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				{
					const right = ($$anchor) => {
						CloseButton($$anchor, { onclick: () => text("") });
					};

					Input(node_4, {
						type: 'text',
						placeholder: 'Write your blockquote text',
						class: 'mb-4 pr-12',
						get value() {
							return text();
						},

						set value($$value) {
							text($$value);
						},
						right,
						$$slots: { right: true }
					});
				}

				var div = $.sibling(node_4, 2);
				var node_5 = $.child(div);

				A(node_5, {
					href: '/',
					get color() {
						return $.get(anchorColor);
					},

					get class() {
						return $.get(linkClass);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_4 = root();
						var text_3 = $.first_child(fragment_4);
						var node_6 = $.sibling(text_3);

						{
							var consequent = ($$anchor) => {
								ArrowRightOutline($$anchor, { class: 'ms-2 h-6 w-6' });
							};

							$.if(node_6, ($$render) => {
								if ($.get(linkIcon)) $$render(consequent);
							});
						}

						$.template_effect(() => $.set_text(text_3, `${text() ?? ''} `));
						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_7 = $.child(div_1);

				Label(node_7, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Color');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				$.each(node_8, 17, () => colors, $.index, ($$anchor, colorOption) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-24" },
						name: 'anchor_color',
						get color() {
							return $.get(colorOption);
						},

						get value() {
							return $.get(colorOption);
						},

						get group() {
							return $.get(anchorColor);
						},

						set group($$value) {
							$.set(anchorColor, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text();

							$.template_effect(() => $.set_text(text_5, $.get(colorOption)));
							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_9 = $.child(div_2);

				Button(node_9, {
					class: 'w-36',
					color: 'blue',
					onclick: changeLinkClass,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text();

						$.template_effect(() => $.set_text(text_6, $.get(linkClass) === "font-medium hover:underline" ? "Change class" : "Remove class"));
						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				Button(node_10, {
					class: 'w-36',
					color: 'pink',
					onclick: changeIcon,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text();

						$.template_effect(() => $.set_text(text_7, $.get(linkIcon) ? "Remove icon" : "Add icon"));
						$.append($$anchor, text_7);
					},
					$$slots: { default: true }
				});

				$.reset(div_2);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}