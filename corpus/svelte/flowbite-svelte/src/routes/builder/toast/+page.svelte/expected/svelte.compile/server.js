import * as $ from 'svelte/internal/server';
import { Toast, toast, Button, Label, Radio, uiHelpers } from "$lib";
import { CheckCircleSolid } from "flowbite-svelte-icons";
import { linear } from "svelte/easing";
import { blur, fly, slide, scale, fade } from "svelte/transition";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Toast builder";

		let description = "A quick way to create Toast component";
		let title = "Toast builder";
		let dir = "builder";
		const colors = Object.keys(toast.variants.color);
		let toastColor = "primary";
		let dismissable = true;

		const changeDismissable = () => {
			dismissable = !dismissable;
		};

		const positions = Object.keys(toast.variants.position);
		let toastPosition = "top-left";

		// transition example
		const transitions = [
			{ name: "Default", transition: fly, params: { duration: 400 } },
			{
				name: "Fly",
				transition: fly,
				params: { duration: 300, easing: linear, x: 150 }
			},

			{
				name: "Blur",
				transition: blur,
				params: { duration: 400, easing: linear }
			},

			{
				name: "Slide",
				transition: slide,
				params: { duration: 500, easing: linear, x: -150 }
			},

			{
				name: "Scale",
				transition: scale,
				params: { duration: 400, easing: linear }
			},

			{
				name: "Fade",
				transition: fade,
				params: { duration: 500, easing: linear }
			}
		];

		let selectedTransition = "Default";
		let currentTransition = $.derived(() => transitions.find((t) => t.name === selectedTransition) || transitions[0]);
		let toastStatus = true;

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (toastColor !== "primary") props.push(` color="${toastColor}"`);
			if (dismissable !== true) props.push(" dismissable={false}");
			if (toastPosition !== "top-left") props.push(` position="${toastPosition}"`);

			if (currentTransition() !== transitions[0] && dismissable) {
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

			return `<div class="relative h-56">
  <Toast${propsString}>My Toast</Toast>
</div>`;
		})());

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
					$$renderer.push(`<!---->Toast Builder`);
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
						$$renderer.push(`<div class="relative h-28 md:h-56">`);

						{
							function icon($$renderer) {
								CheckCircleSolid($$renderer, { class: 'h-5 w-5' });
								$$renderer.push(`<!----> <span class="sr-only">Check icon</span>`);
							}

							Toast($$renderer, {
								color: toastColor,
								dismissable,
								transition: currentTransition().transition,
								params: currentTransition().params,
								position: toastPosition,
								get toastStatus() {
									return toastStatus;
								},

								set toastStatus($$value) {
									toastStatus = $$value;
									$$settled = false;
								},
								icon,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Toast content`);
								},
								$$slots: { icon: true, default: true }
							});
						}

						$$renderer.push(`<!----></div> <div class="mb-4">`);

						Button($$renderer, {
							disabled: toastStatus ? true : false,
							onclick: () => toastStatus = true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Open toast`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="mb-4 flex flex-wrap space-x-2">`);

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
								name: 'interactive_toast_color',
								color: colorOption,
								value: colorOption,
								get group() {
									return toastColor;
								},

								set group($$value) {
									toastColor = $$value;
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
								class: 'my-1',
								classes: { label: "w-16" },
								name: 'interactive_toast_transition',
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

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Position`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_2 = $.ensure_array_like(positions);

						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							let option = each_array_2[$$index_2];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-32" },
								name: 'interactive_toast_position',
								value: option,
								get group() {
									return toastPosition;
								},

								set group($$value) {
									toastPosition = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(option)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap gap-2">`);

						Button($$renderer, {
							onclick: changeDismissable,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(dismissable ? "Disable" : "Enable")} dismissable`);
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