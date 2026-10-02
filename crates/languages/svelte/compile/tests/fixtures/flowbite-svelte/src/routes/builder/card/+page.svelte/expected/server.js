import * as $ from 'svelte/internal/server';
import { Card, card, Button, Toggle, Label, Radio, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Card builder";

		let description = "A quick way to create Card component";
		let title = "Card builder";
		let dir = "builder";
		let reverse = false;
		const sizes = Object.keys(card.variants.size);
		let cardSize = "sm";
		const colors = Object.keys(card.variants.color);
		let color = "gray";
		const shadows = Object.keys(card.variants.shadow);
		let cardShadow = "md";
		let horizontal = false;

		const changeImgLayout = () => {
			horizontal = !horizontal;
		};

		let link = "";

		const changeLink = () => {
			link = link === "" ? "/" : "";
		};

		let cardClass = "";

		const changeClass = () => {
			cardClass = cardClass === "" ? "pl-10" : "";
		};

		let cardImage = undefined;

		const changeImage = () => {
			cardImage = !cardImage
				? { src: "/images/image-1.webp", alt: "my image" }
				: undefined;
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (cardSize !== "sm") props.push(` size="${cardSize}"`);
			if (color !== "gray") props.push(` color="${color}"`);
			if (cardShadow !== "md") props.push(` shadow="${cardShadow}"`);
			if (cardClass) props.push(` class="${cardClass}"`);
			if (link) props.push(` href="${link}"`);
			if (horizontal) props.push(` horizontal`);
			if (reverse) props.push(` reverse`);

			if (cardImage && typeof cardImage === "object") {
				props.push(` img=${cardImage.src}`);
			}

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Card${propsString}>My Card</Card>`;
		})());

		// for interactive builder
		let builder = uiHelpers();

		let builderExpand = false;
		let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow(generatedCode()));

		const handleBuilderExpandClick = () => {
			builderExpand = !builderExpand;
		};

		// end of DynamicCodeBlock setup
		// helper function
		const hasImageContent = (img) => {
			return !!img && !!img.src;
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			H1($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Card Builder`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			MetaTag($$renderer, { breadcrumb_title, description, title, dir });
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
						$$renderer.push(`<div class="flex justify-center">`);

						Card($$renderer, {
							size: cardSize,
							color,
							shadow: cardShadow,
							href: link ? link : "",
							class: cardClass,
							img: cardImage?.src,
							horizontal,
							reverse,
							children: ($$renderer) => {
								$$renderer.push(`<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions</h5> <p class="leading-tight font-normal text-gray-700 dark:text-gray-300">Here are the biggest enterprise technology acquisitions of so far, in reverse chronological order.</p>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="my-4 flex flex-wrap space-x-4">`);

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
								classes: { label: "w-16" },
								name: 'interactive_card_size',
								value: size,
								get group() {
									return cardSize;
								},

								set group($$value) {
									cardSize = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(size)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap space-x-2">`);

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
							let colorOption = each_array_1[$$index_1];

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

						$$renderer.push(`<!--]--></div> <div class="my-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Shadow`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_2 = $.ensure_array_like(shadows);

						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							let shadow = each_array_2[$$index_2];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-16" },
								name: 'interactive_card_shadow',
								value: shadow,
								get group() {
									return cardShadow;
								},

								set group($$value) {
									cardShadow = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(shadow)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-40',
							color: 'sky',
							onclick: changeLink,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(link === "" ? "Add link" : "Remove link")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'green',
							onclick: changeClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(cardClass ? "Remove class" : "Add class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'blue',
							onclick: changeImage,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(hasImageContent(cardImage) ? "Remove image" : "Add image")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							disabled: !hasImageContent(cardImage),
							class: 'w-40',
							color: 'violet',
							onclick: changeImgLayout,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(horizontal ? "Vertical" : "Horizontal")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Toggle($$renderer, {
							class: `italic dark:text-gray-500 ${!hasImageContent(cardImage) ? 'cursor-not-allowed opacity-50' : ''}`,
							disabled: !hasImageContent(cardImage),
							get checked() {
								return reverse;
							},

							set checked($$value) {
								reverse = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								$$renderer.push(`<!---->Reverse: ${$.escape(reverse)}`);
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