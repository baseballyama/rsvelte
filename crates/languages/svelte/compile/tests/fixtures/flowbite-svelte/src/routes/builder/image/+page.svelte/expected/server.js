import * as $ from 'svelte/internal/server';
import { Img, img, Badge, Radio, Label, Button, uiHelpers } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Image builder";

		let description = "A quick way to create Image component";
		let title = "Image builder";
		let dir = "builder";
		const sizes = Object.keys(img.variants.size);
		let imgSize = undefined;

		// const alignments = Object.keys(img.variants.alignment);
		// let imgAlignment: ImgProps['alignment'] = $state('left');
		const effects = Object.keys(img.variants.effect);

		let imgEffect = undefined;

		// const shadows = Object.keys(img.variants.shadow);
		// let imgShadow: ImgProps['shadow'] = $state('none');
		// const roundeds = Object.keys(img.variants.rounded);
		// let imgRounded: ImgProps['rounded'] = $state('none');
		let imgClass = "mx-auto";

		let imgCaption = false;

		const changeImgCaption = () => {
			imgCaption = !imgCaption;
		};

		let imgHref = "";

		const changeImgHrf = () => {
			imgHref = imgHref === "" ? "/" : "";
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			// size, alignment, effect, shadow, rounded, caption, imgClass, figClass, captionClass,
			let props = [];

			if (imgSize !== undefined) props.push(` size="${imgSize}"`);

			// if (imgAlignment !== 'left') props.push(` alignment="${imgAlignment}"`);
			if (imgEffect !== undefined) props.push(` effect="${imgEffect}"`);

			// if (imgShadow !== 'none') props.push(` shadow="${imgShadow}"`);
			// if (imgRounded !== 'none') props.push(` rounded="${imgRounded}"`);
			if (imgEffect !== undefined && imgCaption) props.push(` figClass="relative max-w-sm transition-all duration-300 cursor-pointer filter grayscale hover:grayscale-0"`);

			if (imgEffect !== undefined && imgCaption) props.push(` captionClass="absolute bottom-6 px-4 text-lg text-white"`);
			if (imgCaption) props.push(` caption="Image caption"`);
			if (imgHref) props.push(` href="/"`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Img${propsString} src='/images/examples/content-gallery-3.png'/>`;
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
					$$renderer.push(`<!---->Image Builder`);
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
						$$renderer.push(`<div class="relative mb-4 overflow-y-auto md:h-[700px]">`);

						Img($$renderer, {
							src: imgEffect !== undefined
								? "/images/examples/content-gallery-3.png"
								: imgClass.includes("full")
									? "/images/examples/image-4@2x.jpg"
									: "/images/examples/image-1@2x.jpg",
							size: imgSize,
							class: imgClass,
							alt: 'sample 1',
							effect: imgEffect,
							figClass: imgEffect !== undefined && imgCaption
								? "relative max-w-sm transition-all duration-300 cursor-pointer filter grayscale hover:grayscale-0"
								: "",

							captionClass: imgEffect !== undefined && imgCaption
								? "absolute bottom-6 px-4 text-lg text-white mx-auto"
								: "",

							caption: imgEffect !== undefined
								? "Do you want to get notified when a new component is added to Flowbite?"
								: imgCaption ? "Image caption" : "",
							href: imgHref
						});

						$$renderer.push(`<!----></div> <div class="mb-4 flex flex-wrap space-x-2">`);

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
							let option = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-16" },
								name: 'img_size',
								value: option,
								get group() {
									return imgSize;
								},

								set group($$value) {
									imgSize = $$value;
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
								$$renderer.push(`<!---->Effect`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(effects);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let effect = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'img_effect',
								value: effect,
								get group() {
									return imgEffect;
								},

								set group($$value) {
									imgEffect = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(effect)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-48',
							color: 'blue',
							onclick: changeImgCaption,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(imgCaption ? "Remove caption" : "Add caption")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-48',
							color: 'lime',
							onclick: changeImgHrf,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(imgHref === "" ? "Add href" : "Remove href")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { codeblock: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				large: true,
				class: 'my-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Warning: the caption is using @html.`);
				},
				$$slots: { default: true }
			});

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