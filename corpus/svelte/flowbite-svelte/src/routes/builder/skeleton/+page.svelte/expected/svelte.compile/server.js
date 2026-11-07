import * as $ from 'svelte/internal/server';

import {
	Skeleton,
	skeleton,
	CardPlaceholder,
	ImagePlaceholder,
	imagePlaceholder,
	VideoPlaceholder,
	TextPlaceholder,
	ListPlaceholder,
	Label,
	Radio,
	WidgetPlaceholder,
	Button,
	uiHelpers
} from "$lib";

import { HighlightCompo } from "svelte-rune-highlight";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import H2 from "../utils/H2.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Skeleton builder";

		let description = "A quick way to create Skeleton component";
		let title = "Skeleton builder";
		let dir = "builder";

		// size
		const skeletonSizes = Object.keys(skeleton.variants.size);

		let skeletonSize = "sm";
		const imageSizes = Object.keys(imagePlaceholder.variants.size);
		let imagePlaceholderSize = "md";
		let imagePlaceholderRounded = "none";
		const videoSizes = skeletonSizes;
		let videoPlaceholderSize = "sm";
		const imageRoundedSizes = Object.keys(imagePlaceholder.variants.rounded);
		const textSizes = skeletonSizes;
		let textPlaceholderSize = "sm";
		const cardSizes = skeletonSizes;
		let cardPlaceholderSize = "sm";
		const listSizes = imageSizes;
		const listRoundedSizes = imageRoundedSizes;
		const listItemNumbers = [1, 2, 3, 4, 5];
		let listPlaceholderSize = "md";
		let listPlaceholderRounded = "none";
		let listPlaceholderItemNumber = 5;

		// class
		let skeletonClass = "";

		let imagePlaceholderClass = "";
		let videoPlaceholderClass = "";
		let textPlaceholderClass = "";
		let cardPlaceholderClass = "";
		let widgetPlaceholderClass = "";
		let listPlaceholderClass = "";

		// code generator
		const generatePlaceholderCode = (componentName, size, classes) => {
			let props = [];

			if (componentName === "Skeleton" && size !== "sm") props.push(` size="${size}"`);
			if (componentName === "ImagePlaceholder" && size !== "md") props.push(` size="${size}"`);
			if (componentName === "VideoPlaceholder" && size !== "sm") props.push(` size="${size}"`);
			if (componentName === "TextPlaceholder" && size !== "sm") props.push(` size="${size}"`);
			if (componentName === "CardPlaceholder" && size !== "sm") props.push(` size="${size}"`);
			if (componentName === "ListPlaceholder" && size !== "md") props.push(` size="${size}"`);
			if (classes !== "") props.push(` class="${classes}"`);
			if (componentName === "ImagePlaceholder" && imagePlaceholderRounded !== "none") props.push(` rounded="${imagePlaceholderRounded}"`);
			if (componentName === "ListPlaceholder" && listPlaceholderItemNumber !== 5) props.push(` itemNumber={${listPlaceholderItemNumber}}`);
			if (componentName === "ListPlaceholder" && listPlaceholderRounded !== "none") props.push(` rounded="${listPlaceholderRounded}"`);

			return `<${componentName}${props.join("")} />`;
		};

		let generatedCodeSkeleton = $.derived(() => generatePlaceholderCode("Skeleton", skeletonSize, skeletonClass));
		let generatedCodeVideo = $.derived(() => generatePlaceholderCode("VideoPlaceholder", videoPlaceholderSize, videoPlaceholderClass));
		let generatedCodeText = $.derived(() => generatePlaceholderCode("TextPlaceholder", textPlaceholderSize, textPlaceholderClass));
		let generatedCodeCard = $.derived(() => generatePlaceholderCode("CardPlaceholder", cardPlaceholderSize, cardPlaceholderClass));
		let generatedCodeImage = $.derived(() => generatePlaceholderCode("ImagePlaceholder", imagePlaceholderSize, imagePlaceholderClass));
		let generatedCodeWidget = $.derived(() => generatePlaceholderCode("WidgetPlaceholder", "md", widgetPlaceholderClass));
		let generatedCodeList = $.derived(() => generatePlaceholderCode("ListPlaceholder", listPlaceholderSize, listPlaceholderClass));

		// for interactive builder
		let builder = uiHelpers();

		let builderExpand = false;
		let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow(generatedCodeSkeleton()));

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
					$$renderer.push(`<!---->Skeleton Builder`);
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
						code: generatedCodeSkeleton()
					});
				}

				CodeWrapper($$renderer, {
					codeblock,
					children: ($$renderer) => {
						$$renderer.push(`<div class="md:h-40">`);
						Skeleton($$renderer, { size: skeletonSize, class: skeletonClass });
						$$renderer.push(`<!----></div> <div class="my-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Size(width)`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(skeletonSizes);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let size = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-12" },
								name: 'skeletonsize',
								value: size,
								get group() {
									return skeletonSize;
								},

								set group($$value) {
									skeletonSize = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(size)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> `);

						Button($$renderer, {
							class: 'w-36',
							onclick: () => skeletonClass === "" ? skeletonClass = "ml-4" : skeletonClass = "",
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(skeletonClass ? "Remove class" : "Add class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { codeblock: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			H2($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Image placeholder`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function codeblock($$renderer) {
					HighlightCompo($$renderer, { code: generatedCodeImage() });
				}

				CodeWrapper($$renderer, {
					codeblock,
					children: ($$renderer) => {
						$$renderer.push(`<div class="md:h-64">`);

						ImagePlaceholder($$renderer, {
							size: imagePlaceholderSize,
							rounded: imagePlaceholderRounded,
							class: imagePlaceholderClass
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

						const each_array_1 = $.ensure_array_like(imageSizes);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let size = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-12" },
								name: 'imageSize',
								value: size,
								get group() {
									return imagePlaceholderSize;
								},

								set group($$value) {
									imagePlaceholderSize = $$value;
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
								$$renderer.push(`<!---->Rounded`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_2 = $.ensure_array_like(imageRoundedSizes);

						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							let size = each_array_2[$$index_2];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-12" },
								name: 'imageRoundedSize',
								value: size,
								get group() {
									return imagePlaceholderRounded;
								},

								set group($$value) {
									imagePlaceholderRounded = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(size)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> `);

						Button($$renderer, {
							class: 'w-36',
							onclick: () => imagePlaceholderClass === ""
								? imagePlaceholderClass = "ml-4"
								: imagePlaceholderClass = "",

							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(imagePlaceholderClass ? "Remove class" : "Add class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { codeblock: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			H2($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Video placeholder`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function codeblock($$renderer) {
					HighlightCompo($$renderer, { code: generatedCodeVideo() });
				}

				CodeWrapper($$renderer, {
					codeblock,
					children: ($$renderer) => {
						$$renderer.push(`<div class="md:h-64">`);
						VideoPlaceholder($$renderer, { size: videoPlaceholderSize, class: videoPlaceholderClass });
						$$renderer.push(`<!----></div> <div class="my-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Size(width)`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_3 = $.ensure_array_like(videoSizes);

						for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
							let size = each_array_3[$$index_3];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-12" },
								name: 'videoSize',
								value: size,
								get group() {
									return videoPlaceholderSize;
								},

								set group($$value) {
									videoPlaceholderSize = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(size)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> `);

						Button($$renderer, {
							class: 'w-36',
							onclick: () => videoPlaceholderClass === ""
								? videoPlaceholderClass = "ml-4"
								: videoPlaceholderClass = "",

							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(videoPlaceholderClass ? "Remove class" : "Add class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { codeblock: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			H2($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Text placeholder`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function codeblock($$renderer) {
					HighlightCompo($$renderer, { code: generatedCodeText() });
				}

				CodeWrapper($$renderer, {
					codeblock,
					children: ($$renderer) => {
						TextPlaceholder($$renderer, { size: textPlaceholderSize, class: textPlaceholderClass });
						$$renderer.push(`<!----> <div class="my-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Size(width)`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_4 = $.ensure_array_like(textSizes);

						for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
							let size = each_array_4[$$index_4];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-12" },
								name: 'textSize',
								value: size,
								get group() {
									return textPlaceholderSize;
								},

								set group($$value) {
									textPlaceholderSize = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(size)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> `);

						Button($$renderer, {
							class: 'w-36',
							onclick: () => textPlaceholderClass === ""
								? textPlaceholderClass = "ml-4"
								: textPlaceholderClass = "",

							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(textPlaceholderClass ? "Remove class" : "Add class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { codeblock: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			H2($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Card placeholder`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function codeblock($$renderer) {
					HighlightCompo($$renderer, { code: generatedCodeCard() });
				}

				CodeWrapper($$renderer, {
					codeblock,
					children: ($$renderer) => {
						CardPlaceholder($$renderer, { size: cardPlaceholderSize, class: cardPlaceholderClass });
						$$renderer.push(`<!----> <div class="my-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Size(width)`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_5 = $.ensure_array_like(cardSizes);

						for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
							let size = each_array_5[$$index_5];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-12" },
								name: 'cardSize',
								value: size,
								get group() {
									return cardPlaceholderSize;
								},

								set group($$value) {
									cardPlaceholderSize = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(size)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> `);

						Button($$renderer, {
							class: 'w-36',
							onclick: () => cardPlaceholderClass === ""
								? cardPlaceholderClass = "ml-4"
								: cardPlaceholderClass = "",

							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(cardPlaceholderClass ? "Remove class" : "Add class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { codeblock: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			H2($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Widget placeholder`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function codeblock($$renderer) {
					HighlightCompo($$renderer, { code: generatedCodeWidget() });
				}

				CodeWrapper($$renderer, {
					codeblock,
					children: ($$renderer) => {
						WidgetPlaceholder($$renderer, { class: widgetPlaceholderClass });
						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'mt-4 w-36',
							onclick: () => widgetPlaceholderClass === ""
								? widgetPlaceholderClass = "ml-4"
								: widgetPlaceholderClass = "",

							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(widgetPlaceholderClass ? "Remove class" : "Add class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { codeblock: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			H2($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->List placeholder`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function codeblock($$renderer) {
					HighlightCompo($$renderer, { code: generatedCodeList() });
				}

				CodeWrapper($$renderer, {
					codeblock,
					children: ($$renderer) => {
						$$renderer.push(`<div class="md:h-[500px]">`);

						ListPlaceholder($$renderer, {
							itemNumber: listPlaceholderItemNumber,
							size: listPlaceholderSize,
							rounded: listPlaceholderRounded,
							class: listPlaceholderClass
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

						const each_array_6 = $.ensure_array_like(listSizes);

						for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
							let size = each_array_6[$$index_6];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-12" },
								name: 'size',
								value: size,
								get group() {
									return listPlaceholderSize;
								},

								set group($$value) {
									listPlaceholderSize = $$value;
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
								$$renderer.push(`<!---->Rounded`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_7 = $.ensure_array_like(listRoundedSizes);

						for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
							let size = each_array_7[$$index_7];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-12" },
								name: 'roundedSize',
								value: size,
								get group() {
									return listPlaceholderRounded;
								},

								set group($$value) {
									listPlaceholderRounded = $$value;
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
								$$renderer.push(`<!---->Items:`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_8 = $.ensure_array_like(listItemNumbers);

						for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
							let itemNumber = each_array_8[$$index_8];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-10" },
								name: 'itemNumber',
								value: itemNumber,
								get group() {
									return listPlaceholderItemNumber;
								},

								set group($$value) {
									listPlaceholderItemNumber = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(itemNumber)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> `);

						Button($$renderer, {
							class: 'w-36',
							onclick: () => listPlaceholderClass === ""
								? listPlaceholderClass = "ml-4"
								: listPlaceholderClass = "",

							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(listPlaceholderClass ? "Remove class" : "Add class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
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