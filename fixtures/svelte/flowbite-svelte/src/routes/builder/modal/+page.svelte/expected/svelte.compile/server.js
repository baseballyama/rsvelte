import * as $ from 'svelte/internal/server';
import { fade, blur, fly, slide, scale } from "svelte/transition";
import { linear } from "svelte/easing";
import { Radio, Label, Modal, modal, Button, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Modal builder";

		let description = "A quick way to create Modal component";
		let title = "Modal builder";
		let dir = "builder";
		let defaultModal = false;

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

		let placement = "center";
		const sizes = Object.keys(modal.variants.size);
		let modalSize = "md";

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

		let selectedTransition = "Fade";
		let currentTransition = $.derived(() => transitions.find((t) => t.name === selectedTransition) || transitions[0]);

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (modalSize !== "md") props.push(`size="${modalSize}"`);
			if (placement !== "center") props.push(`placement="${placement}"`);

			if (currentTransition() !== transitions[0]) {
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
					$$renderer.push(`<!---->Modal Builder`);
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
						$$renderer.push(`<div class="mb-4 h-20"><div class="flex justify-center">`);

						Button($$renderer, {
							onclick: () => defaultModal = true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Default modal`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> `);

						Modal($$renderer, {
							title: 'Terms of Service',
							size: modalSize,
							placement,
							transition: currentTransition().transition,
							transitionParams: currentTransition().params,
							autoclose: true,
							get open() {
								return defaultModal;
							},

							set open($$value) {
								defaultModal = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								$$renderer.push(`<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident odit quis fugit beatae, veritatis minus cupiditate ea numquam facere iusto vitae sequi, ipsum ducimus quo eaque illum.
        Eveniet, dolorem autem.</p>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="mb-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Size`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(sizes);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let size = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-12" },
								name: 'modal-size',
								value: size,
								get group() {
									return modalSize;
								},

								set group($$value) {
									modalSize = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(size)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-4">`);

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
							let position = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-32" },
								name: 'modal-position',
								value: position,
								get group() {
									return placement;
								},

								set group($$value) {
									placement = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(position)}`);
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

						const each_array_2 = $.ensure_array_like(transitions);

						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							let transition = each_array_2[$$index_2];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-16" },
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

						$$renderer.push(`<!--]--></div>`);
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