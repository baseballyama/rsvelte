import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Drawer, Drawerhead, Button, uiHelpers, Label, Radio } from "$lib";
import { InfoCircleSolid } from "flowbite-svelte-icons";
import { blur, fly, slide, scale, fade } from "svelte/transition";
import { linear, sineIn } from "svelte/easing";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";

var root = $.from_html(`<h5 id="drawer-label" class="inline-flex items-center text-xl font-semibold text-gray-500 dark:text-gray-400"><!> </h5>`);
var root_1 = $.from_html(`<!> <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Content</p> <p class="mb-6 text-sm text-gray-500 dark:text-gray-400"> </p>`, 1);
var root_2 = $.from_html(`<div class="text-center"><!></div> <!> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="mb-4 flex flex-wrap space-x-2"><!> <!></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start"><!></div>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	let open = $.state(false);

	// transition
	// color: Drawer['color'];
	const transitions = [
		{
			name: "Fly",
			transition: fly,
			params: { duration: 300, easing: linear, x: -150 }
		},

		{
			name: "Blur",
			transition: blur,
			params: { duration: 400, easing: sineIn }
		},

		{
			name: "Slide",
			transition: slide,
			params: { duration: 200, easing: linear }
		},

		{
			name: "Scale",
			transition: scale,
			params: { duration: 300, easing: sineIn }
		},

		{
			name: "Fade",
			transition: fade,
			params: { duration: 400, easing: linear }
		}
	];

	let selectedTransition = $.state("Fly");
	let currentTransition = $.derived(() => transitions.find((t) => t.name === $.get(selectedTransition)) || transitions[0]);

	const placements = [
		{
			name: "Left",
			placement: "left",
			params: { x: -320, duration: 300, easing: sineIn },
			width: "default"
		},

		{
			name: "Top",
			placement: "top",
			params: { y: -320, duration: 300, easing: sineIn },
			width: "full"
		},

		{
			name: "Right",
			placement: "right",
			params: { x: 320, duration: 300, easing: sineIn },
			width: "default"
		},

		{
			name: "Bottom",
			placement: "bottom",
			params: { y: 320, duration: 300, easing: sineIn },
			width: "full"
		}
	];

	let selectedPlacement = $.state("Left");
	let currentPlacement = $.derived(() => placements.find((p) => p.name === $.get(selectedPlacement)) || placements[0]);

	// outsideclick
	let outsideclickStatus = $.state(true);

	const changeOutsideclickStatus = () => {
		$.set(outsideclickStatus, !$.get(outsideclickStatus));
	};

	// $effect(() => {
	// 	changeOutsideclickStatus;
	// })
	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if (!$.get(outsideclickStatus)) props.push(" activateClickOutside={false}");
		if ($.get(currentPlacement).width !== "default") props.push(` width="${$.get(currentPlacement).width}"`);

		if ($.get(currentTransition) !== transitions[0]) {
			props.push(` transitionType={${$.get(currentTransition).transition.name}}`);

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

		// placement
		if ($.get(currentPlacement) !== placements[0]) {
			props.push(` placement="${$.get(currentPlacement).placement}"`);
		}

		const propsString = props.length > 0
			? props.map((prop) => `\n  ${prop}`).join("") + "\n"
			: "";

		return `<Button onclick={drawer.toggle}>Drawer</Button>
<Drawer drawerStatus={drawerStatus} closeDrawer={closeDrawer}${propsString}>
  <Drawerhead onclick={closeDrawer} class="mb-4>
    <h5 id="drawer-label" class="inline-flex items-center text-xl font-semibold text-gray-500 dark:text-gray-400">
        <InfoCircleSolid class="me-2.5 h-5 w-5" />${$.get(selectedTransition)} drawer
      </h5>
  </Drawerhead>
    My Drawer
</Drawer>`;
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

	var fragment = root_3();
	var node = $.first_child(fragment);

	H1(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Drawer Builder');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

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

		CodeWrapper(node_1, {
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_2();
				var div = $.first_child(fragment_2);
				var node_2 = $.child(div);

				Button(node_2, {
					onclick: () => $.set(open, true),
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Drawer');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.reset(div);

				var node_3 = $.sibling(div, 2);

				{
					let $0 = $.derived(() => $.get(currentPlacement).placement === "left"
						? $.get(currentTransition).params
						: $.get(currentPlacement).params);

					Drawer(node_3, {
						get transition() {
							return $.get(currentTransition).transition;
						},

						get placement() {
							return $.get(currentPlacement).placement;
						},

						get width() {
							return $.get(currentPlacement).width;
						},

						get transitionParams() {
							return $.get($0);
						},

						get outsideclose() {
							return $.get(outsideclickStatus);
						},

						get open() {
							return $.get(open);
						},

						set open($$value) {
							$.set(open, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_4 = $.first_child(fragment_3);

							Drawerhead(node_4, {
								onclick: () => $.set(open, false),
								class: 'mb-4',
								children: ($$anchor, $$slotProps) => {
									var h5 = root();
									var node_5 = $.child(h5);

									InfoCircleSolid(node_5, { class: 'me-2.5 h-5 w-5' });

									var text_2 = $.sibling(node_5);

									$.reset(h5);
									$.template_effect(() => $.set_text(text_2, `${$.get(selectedTransition) ?? ''} drawer`));
									$.append($$anchor, h5);
								},
								$$slots: { default: true }
							});

							var p_1 = $.sibling(node_4, 4);
							var text_3 = $.only_child(p_1);

							$.template_effect(() => $.set_text(text_3, `Outsideclose: ${$.get(outsideclickStatus) ? "true" : "false"}`));
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				}

				var div_1 = $.sibling(node_3, 2);
				var node_6 = $.child(div_1);

				Label(node_6, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Transition');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				$.each(node_7, 17, () => transitions, $.index, ($$anchor, transition) => {
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

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_8 = $.child(div_2);

				Label(node_8, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Placement');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				$.each(node_9, 17, () => placements, $.index, ($$anchor, placement) => {
					Radio($$anchor, {
						classes: { label: "w-16 my-1" },
						name: 'interactive_placement',
						get value() {
							return $.get(placement).name;
						},

						get group() {
							return $.get(selectedPlacement);
						},

						set group($$value) {
							$.set(selectedPlacement, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text();

							$.template_effect(() => $.set_text(text_7, $.get(placement).name));
							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_10 = $.child(div_3);

				Button(node_10, {
					class: 'w-48',
					onclick: changeOutsideclickStatus,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(outsideclickStatus) ? "Disable outsideclick" : "Enable outsideclick"));
						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				$.reset(div_3);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}