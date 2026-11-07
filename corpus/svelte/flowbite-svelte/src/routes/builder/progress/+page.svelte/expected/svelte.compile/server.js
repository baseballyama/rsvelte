import * as $ from 'svelte/internal/server';
import { Progressbar, progressbar, Button, Label, Radio, uiHelpers } from "$lib";
import { sineOut } from "svelte/easing";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Progress builder";

		let description = "A quick way to create Progress component";
		let title = "Progress builder";
		let dir = "builder";
		let progress = "45";

		const progressSizes = [
			{ size: "h-4", class: "" },
			{ size: "h-6", class: "p-2" },
			{ size: "h-8", class: "p-3" },
			{ size: "h-10", class: "p-4" }
		];

		function updateProgressSize(selectedSize) {
			const newSize = progressSizes.find((size) => size.size === selectedSize);

			if (newSize) {
				progressSize = newSize;
			}
		}

		let progressSize = progressSizes[0];

		// const sizes = [ 'h-4 ', 'h-6', 'h-8', 'h-10'];
		// let progressSize = $state('h-4');
		const colors = Object.keys(progressbar.variants.color);

		let progressColor = "primary";
		let labelInside = false;

		const changeLabelInside = () => {
			labelInside = !labelInside;
		};

		let { labelContent = "Svelte-5-Ui-Lib" } = $$props;

		const changeLabelContent = () => {
			labelContent = labelContent === "Svelte-5-Ui-Lib" ? "" : "Svelte-5-Ui-Lib";
		};

		let animation = false;
		let tweenDuration = void 0;
		let easing = void 0;

		const changeAnimation = () => {
			animation = !animation;

			if (animation) {
				tweenDuration = 1500;
				easing = sineOut;
			} else {
				tweenDuration = undefined;
				easing = undefined;
			}
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			// progress
			props.push(` progress="${progress}"`);

			if (progressColor !== "primary") props.push(` color="${progressColor}"`);
			if (labelInside) props.push(" labelInside");
			if (labelContent !== "") props.push(` labelOutside="${labelContent}"`);
			if (progressSize.size !== "h-4") props.push(` size="${progressSize.size}"`);

			// Add labelInsideClass prop if not empty
			if (progressSize.class !== "") {
				props.push(` classes={{ labelInsideClass:"${progressSize.class}" }}`);
			}

			if (animation) {
				props.push(" animate");
				props.push(" precision={0}");
				props.push(" tweenDuration={1500}");
				props.push(" easing={sineOut}");
			}

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Progressbar${propsString} />`;
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
					$$renderer.push(`<!---->Progressbar Builder`);
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
						$$renderer.push(`<div class="my-8 h-16">`);

						if (animation) {
							$$renderer.push('<!--[0-->');

							Progressbar($$renderer, {
								progress,
								size: progressSize.size,
								color: progressColor,
								labelOutside: labelContent,
								labelInside,
								classes: { label: progressSize.class },
								animate: true,
								tweenDuration,
								easing
							});
						} else {
							$$renderer.push('<!--[-1-->');

							Progressbar($$renderer, {
								progress,
								size: progressSize.size,
								color: progressColor,
								labelOutside: labelContent,
								labelInside,
								classes: { label: progressSize.class }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-8 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Size`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(progressSizes);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let size = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'progress_size',
								value: size.size,
								onchange: () => updateProgressSize(size.size),
								get group() {
									return progressSize.size;
								},

								set group($$value) {
									progressSize.size = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(size.size)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-8 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Color`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(colors);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let color = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'interactive_progress_color',
								color,
								value: color,
								get group() {
									return progressColor;
								},

								set group($$value) {
									progressColor = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(color)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-48',
							onclick: changeLabelContent,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(labelContent ? "Remove outlise label" : "Add outside label")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-48',
							color: 'purple',
							onclick: changeLabelInside,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(labelInside ? "Remove inside label" : "Add inside label")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-48',
							color: 'red',
							onclick: changeAnimation,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(animation ? "No animation" : "Animation")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-48',
							color: 'emerald',
							onclick: () => progress = `${Math.round(Math.random() * 100)}`,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Randomize`);
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
		$.bind_props($$props, { labelContent });
	});
}