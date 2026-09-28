import * as $ from 'svelte/internal/server';

import {
	Alert,
	alert as fsalert,
	Button,
	Label,
	Radio,
	uiHelpers,
	Input
} from "$lib";

import { InfoCircleSolid } from "flowbite-svelte-icons";
import { blur, fly, slide, scale } from "svelte/transition";
import { linear } from "svelte/easing";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Alert builder";

		let description = "A quick way to create Alert component";
		let title = "Alert builder";
		let dir = "builder";

		// for interactive code builder
		let alertMessage = "My Alert!";

		const colors = Object.keys(fsalert.variants.color);
		let color = "primary";
		let iconSlot = false;

		const changeIconSlot = () => {
			iconSlot = !iconSlot;
		};

		let rounded = false;

		const changeRounded = () => {
			rounded = !rounded;
		};

		let border = false;

		const changeBorder = () => {
			border = !border;
		};

		let dismissable = true;

		const changeDismissable = () => {
			dismissable = !dismissable;
		};

		let alertStatusInteractive = true;

		const changeStatusInteractive = () => {
			alertStatusInteractive = true;
		};

		let alertClass = "";

		const changeClass = () => {
			alertClass = alertClass === "" ? "pl-10" : "";
		};

		let borderAccent = false;

		const changeBorderAccent = () => {
			borderAccent = !borderAccent;
			alertClass = borderAccent ? "border-t-4" : "";
			rounded = false;
		};

		// end of interactive code builder
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

		let selectedTransition = "Fly";
		let currentTransition = $.derived(() => transitions.find((t) => t.name === selectedTransition) || transitions[0]);

		// code generator
		let generatedCode = $.derived(() => (() => {
			// Generate import script using string literals
			// const importScript = `  // script tag \n  import { Alert } from "flowbite-svelte";\n  // script tag \n`;
			let props = [];

			if (color !== "primary") props.push(` color="${color}"`);
			if (rounded) props.push(" rounded");
			if (border) props.push(" border");
			if (dismissable) props.push(" dismissable");
			if (alertClass) props.push(` class="${alertClass}"`);
			if (!alertStatusInteractive) props.push(" alertStatus={false}");

			if (currentTransition() !== transitions[0] && dismissable) {
				props.push(` transition={${currentTransition().name.toLowerCase()}}`);

				// Generate params string without quotes and handle functions
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
				? props.map((prop) => `\n  ${prop}`).join("") + "\n  "
				: "";

			let iconCode = "";

			if (iconSlot) {
				iconCode = `
    {#snippet icon()}
      <InfoCircleSolid class="h-5 w-5" />
    {/snippet}`;
			}

			// Add import script at the beginning
			return `  <Alert${propsString}>${iconCode}
    ${alertMessage}
  </Alert>`;
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
					$$renderer.push(`<!---->Alert Builder`);
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
					codeblock,
					children: ($$renderer) => {
						$$renderer.push(`<div class="mb-4 h-20">`);

						{
							function icon($$renderer) {
								if (iconSlot) {
									$$renderer.push('<!--[0-->');
									InfoCircleSolid($$renderer, { class: 'h-5 w-5' });
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							Alert($$renderer, {
								color,
								rounded,
								border,
								dismissable,
								class: alertClass,
								transition: currentTransition().transition,
								params: currentTransition().params,
								get alertStatus() {
									return alertStatusInteractive;
								},

								set alertStatus($$value) {
									alertStatusInteractive = $$value;
									$$settled = false;
								},
								icon,
								children: ($$renderer) => {
									$$renderer.push(`<span class="font-medium">${$.escape(alertMessage)}</span>`);
								},
								$$slots: { icon: true, default: true }
							});
						}

						$$renderer.push(`<!----></div> <div class="mb-4 h-12">`);

						Button($$renderer, {
							disabled: alertStatusInteractive ? true : false,
							onclick: changeStatusInteractive,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Open alert`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="mb-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Alert message`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Input($$renderer, {
							get value() {
								return alertMessage;
							},

							set value($$value) {
								alertMessage = $$value;
								$$settled = false;
							}
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

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Transition`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(transitions);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let transition = each_array_1[$$index_1];

							Radio($$renderer, {
								disabled: dismissable ? false : true,
								classes: {
									label: "w-16 my-1 {dismissable ? '' : 'opacity-30 cursor-not-allowed'}"
								},
								name: 'transition_interactive',
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
							class: 'w-48',
							color: 'blue',
							onclick: changeRounded,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(rounded ? "Remove rounded" : "Add rounded")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-48',
							color: 'red',
							onclick: changeBorder,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(border ? "Remove border" : "Add border")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-48',
							color: 'yellow',
							onclick: changeDismissable,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(dismissable ? "Remove dismissable" : "Add dismissable")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-48',
							color: 'green',
							onclick: changeClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(alertClass ? "Remove class" : "Add class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-48',
							color: 'sky',
							onclick: changeIconSlot,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(iconSlot ? "Remove icon" : "Add icon")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-48',
							color: 'rose',
							onclick: changeBorderAccent,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(borderAccent ? "Remove accent" : "Add accent")}`);
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