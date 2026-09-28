import * as $ from 'svelte/internal/server';

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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Banner builder";

		let description = "A quick way to create Banner component";
		let title = "Banner builder";
		let dir = "builder";

		// interactive example
		const colors = Object.keys(banner.variants.color);

		let color = "primary";
		let bannerClass = "absolute";
		let bannerStatus = true;

		const changeStatus = () => {
			bannerStatus = true;
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

		let selectedTransition = "Fly";
		let currentTransition = $.derived(() => transitions.find((t) => t.name === selectedTransition) || transitions[0]);

		// code generator
		let generatedCode = $.derived(() => (() => {
			// position, bannerType color, class
			let props = [];

			if (color !== "primary") props.push(` color="${color}"`);
			if (bannerClass) props.push(` class="${bannerClass}"`);
			if (!bannerStatus) props.push(" bannerStatus={false}");

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
					$$renderer.push(`<!---->Banner Builder`);
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
					class: 'relative',
					innerClass: 'p-0',
					codeblock,
					children: ($$renderer) => {
						$$renderer.push(`<div class="mb-4 h-[670px] md:h-[480px]"><div class="p-6">`);
						Skeleton($$renderer, { class: 'py-4' });
						$$renderer.push(`<!----> `);
						ImagePlaceholder($$renderer, { class: 'py-4' });
						$$renderer.push(`<!----></div> `);

						Banner($$renderer, {
							id: 'sample-banner',
							color,
							class: bannerClass,
							transition: currentTransition().transition,
							params: currentTransition().params,
							get open() {
								return bannerStatus;
							},

							set open($$value) {
								bannerStatus = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								$$renderer.push(`<p class="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400"><span class="me-3 inline-flex rounded-full bg-gray-200 p-1 dark:bg-gray-600">`);
								BullhornOutline($$renderer, { class: 'h-3 w-3 text-gray-500 dark:text-gray-400' });
								$$renderer.push(`<!----> <span class="sr-only">Light bulb</span></span> <span>New brand identity has been launched for the <a href="https://flowbite.com" class="text-primary-600 dark:text-primary-500 inline font-medium decoration-solid decoration-600 dark:decoration-500">Flowbite Library</a></span></p>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="p-6"><div class="mb-4 h-12">`);

						Button($$renderer, {
							class: 'w-48',
							disabled: bannerStatus ? true : false,
							onclick: changeStatus,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Open banner`);
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
								classes: { label: "w-24 my-1" },
								name: 'color',
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
								classes: { label: "w-16 my-1" },
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

						$$renderer.push(`<!--]--></div></div>`);
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