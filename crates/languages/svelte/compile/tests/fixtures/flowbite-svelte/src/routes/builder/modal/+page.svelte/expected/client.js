import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade, blur, fly, slide, scale } from "svelte/transition";
import { linear } from "svelte/easing";
import { Radio, Label, Modal, modal, Button, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident odit quis fugit beatae, veritatis minus cupiditate ea numquam facere iusto vitae sequi, ipsum ducimus quo eaque illum.
        Eveniet, dolorem autem.</p>`);

var root_1 = $.from_html(`<div class="mb-4 h-20"><div class="flex justify-center"><!></div> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-4"><!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	const binding_group_2 = [];

	// MetaTag
	let breadcrumb_title = "Modal builder";

	let description = "A quick way to create Modal component";
	let title = "Modal builder";
	let dir = "builder";
	let defaultModal = $.state(false);

	const placements = [
		"top-left",
		"top-center",
		"top-right",
		"center-left",
		"center",
		"center-right",
		"bottom-left",
		"bottom-center",
		"bottom-right"
	];

	let placement = $.state("center");
	const sizes = Object.keys(modal.variants.size);
	let modalSize = $.state("md");

	// transition
	// let transitionStatus = $state(false);
	const transitions = [
		{
			name: "Fade",
			transition: fade,
			params: { duration: 200, easing: linear }
		},

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

	let selectedTransition = $.state("Fade");
	let currentTransition = $.derived(() => transitions.find((t) => t.name === $.get(selectedTransition)) || transitions[0]);

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(modalSize) !== "md") props.push(`size="${$.get(modalSize)}"`);
		if ($.get(placement) !== "center") props.push(`placement="${$.get(placement)}"`);

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

			props.push(`params={{${paramsString}}}`);
		}

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Modal title="Terms of Service" {modalStatus} {closeModal}${propsString}>
  Modal content
</Modal>`;
	})());

	// end of code generator
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

			var text = $.text('Modal Builder');

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
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var div = $.first_child(fragment_2);
				var div_1 = $.child(div);
				var node_3 = $.child(div_1);

				Button(node_3, {
					onclick: () => $.set(defaultModal, true),
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Default modal');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.reset(div_1);

				var node_4 = $.sibling(div_1, 2);

				Modal(node_4, {
					title: 'Terms of Service',
					get size() {
						return $.get(modalSize);
					},

					get placement() {
						return $.get(placement);
					},

					get transition() {
						return $.get(currentTransition).transition;
					},

					get transitionParams() {
						return $.get(currentTransition).params;
					},
					autoclose: true,
					get open() {
						return $.get(defaultModal);
					},

					set open($$value) {
						$.set(defaultModal, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var p = root();

						$.append($$anchor, p);
					},
					$$slots: { default: true }
				});

				$.reset(div);

				var div_2 = $.sibling(div, 2);
				var node_5 = $.child(div_2);

				Label(node_5, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Size');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node_5, 2);

				$.each(node_6, 17, () => sizes, $.index, ($$anchor, size) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-12" },
						name: 'modal-size',
						get value() {
							return $.get(size);
						},

						get group() {
							return $.get(modalSize);
						},

						set group($$value) {
							$.set(modalSize, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text();

							$.template_effect(() => $.set_text(text_3, $.get(size)));
							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_7 = $.child(div_3);

				Label(node_7, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Position');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				$.each(node_8, 17, () => placements, $.index, ($$anchor, position) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-32" },
						name: 'modal-position',
						get value() {
							return $.get(position);
						},

						get group() {
							return $.get(placement);
						},

						set group($$value) {
							$.set(placement, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text();

							$.template_effect(() => $.set_text(text_5, $.get(position)));
							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_3);

				var div_4 = $.sibling(div_3, 2);
				var node_9 = $.child(div_4);

				Label(node_9, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Transition');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				$.each(node_10, 17, () => transitions, $.index, ($$anchor, transition) => {
					Radio($$anchor, {
						class: 'my-1',
						classes: { label: "w-16" },
						name: 'transition_interactive',
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

							var text_7 = $.text();

							$.template_effect(() => $.set_text(text_7, $.get(transition).name));
							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_4);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}