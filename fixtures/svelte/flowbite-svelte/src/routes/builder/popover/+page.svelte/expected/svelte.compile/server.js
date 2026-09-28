import * as $ from 'svelte/internal/server';
import { blur, fly, slide, scale, fade } from "svelte/transition";
import { sineIn, linear } from "svelte/easing";
import { Popover, popover, Button, Label, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Popover builder";

		let description = "A quick way to create Popover component";
		let title = "Popover builder";
		let dir = "builder";

		const placements = [
			"top",
			"right",
			"bottom",
			"left",
			"top-start",
			"top-end",
			"right-start",
			"right-end",
			"bottom-start",
			"bottom-end",
			"left-start",
			"left-end"
		];

		let placement = "top";

		// const positions = Object.keys(popover.variants.position);
		// let position: PopoverProps['position'] = $state(positions[0]) as PopoverProps['position'];
		const colors = Object.keys(popover.variants.color);

		let color = "default";
		let popoverClass = "w-64 text-sm font-light";

		const changeClass = () => {
			popoverClass = popoverClass === "w-64 text-sm font-light" ? "w-64 text-sm font-light" : "w-64 text-sm font-light";
		};

		let arrow = true;

		const changeArrow = () => {
			arrow = !arrow;
			offset = undefined;
		};

		let offset = void 0;

		const changeOffset = () => {
			offset = offset ?? 8;
			arrow = false;
		};

		// transition
		// color: Drawer['color'];
		const transitions = [
			{
				name: "Fade",
				transition: fade,
				params: { duration: 100, easing: linear }
			},

			{
				name: "Fly",
				transition: fly,
				params: { duration: 300, easing: linear, x: -150 }
			},

			{
				name: "Blur",
				transition: blur,
				params: { duration: 800, easing: sineIn }
			}
		];

		let selectedTransition = "Fade";
		let currentTransition = $.derived(() => transitions.find((t) => t.name === selectedTransition) || transitions[0]);

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (color !== "default") props.push(` color="${color}"`);
			if (placement !== "top") props.push(` placement="${placement}"`);
			if (offset) props.push(` offset="${offset}"`);
			if (popoverClass !== "w-64 text-sm font-light") props.push(` class="${popoverClass}"`);
			if (arrow !== true) props.push(" arrow={false}");

			if (currentTransition() !== transitions[0]) {
				props.push(` transition={${currentTransition().name.toLowerCase()}}`);

				const paramsString = Object.entries(currentTransition().params).map(([key, value]) => {
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

			return `<Button id="demo">Popover</Button>
<Popover titleSlot="Popover title" triggeredBy="#demo"${propsString} >
  My Popover content
</Popover>`;
		})());

		// end of code generator
		// for interactive builder
		let builder = uiHelpers();

		let builderExpand = false;
		let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow(generatedCode()));

		const handleBuilderExpandClick = () => {
			builderExpand = !builderExpand;
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MetaTag($$renderer, { breadcrumb_title, description, title, dir });
			$$renderer.push(`<!----> `);

			H1($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Popover Builder`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function codeblock($$renderer) {
					DynamicCodeBlockHighlight($$renderer, {
						handleExpandClick: handleBuilderExpandClick,
						expand: builderExpand,
						showExpandButton: showBuilderExpandButton(),
						code: generatedCode()
					});
				}

				CodeWrapper($$renderer, {
					class: '',
					codeblock,
					children: ($$renderer) => {
						$$renderer.push(`<div class="flex h-80 items-center justify-center">`);

						Button($$renderer, {
							id: 'b1',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Popover`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Popover($$renderer, {
							color,
							placement,
							arrow,
							offset,
							class: popoverClass,
							transition: currentTransition().transition,
							params: currentTransition().params,
							title: 'Popover title',
							triggeredBy: '#b1',
							children: ($$renderer) => {
								$$renderer.push(`<p>And here's some amazing content. It's very engaging. Right?</p>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="mb-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Color`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(colors);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let colorOption = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'alert_reactive',
								color: colorOption,
								value: colorOption,
								get group() {
									return color;
								},

								set group($$value) {
									color = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(colorOption)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Position`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(placements);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let option = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-28" },
								name: 'interactive_toast_position',
								value: option,
								get group() {
									return placement;
								},

								set group($$value) {
									placement = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(option)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Transition`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_2 = $.ensure_array_like(transitions);

						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							let transition = each_array_2[$$index_2];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-16" },
								name: 'interactive_transition',
								value: transition.name,
								get group() {
									return selectedTransition;
								},

								set group($$value) {
									selectedTransition = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(transition.name)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-36',
							onclick: changeClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(popoverClass !== "w-64 text-sm font-light" ? "Remove class" : "Add class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-36',
							color: 'secondary',
							onclick: changeArrow,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(arrow ? "Remove arrow" : "Add arrow")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-36',
							color: 'rose',
							onclick: changeOffset,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(offset ? "Remove offset" : "Add offset")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { codeblock: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}