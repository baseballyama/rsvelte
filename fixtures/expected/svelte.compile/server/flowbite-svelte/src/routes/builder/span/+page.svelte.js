import * as $ from 'svelte/internal/server';

import {
	P,
	Span,
	span,
	Button,
	Label,
	Radio,
	Input,
	CloseButton,
	uiHelpers
} from "$lib";

import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Span builder";

		let description = "A quick way to create Span component";
		let title = "Span builder";
		let dir = "builder";
		let { editableContent = "span content" } = $$props;
		let spanItalic = false;

		const changeItalic = () => {
			spanItalic = !spanItalic;
		};

		let spanUnderline = false;

		const changeUnderline = () => {
			spanUnderline = !spanUnderline;
			spanDecorationColor = "none";
			spanDecorationThickness = "0";
			spanDecoration = "none";
			spanLinethrough = false;
		};

		let spanLinethrough = false;

		const changeLinethrough = () => {
			spanLinethrough = !spanLinethrough;
			spanUnderline = false;
			spanDecorationColor = "none";
			spanDecorationThickness = "0";
			spanDecoration = "none";
			spanGradient = "none";
		};

		let spanUppercase = false;

		const changeUppercase = () => {
			spanUppercase = !spanUppercase;
		};

		const gradients = Object.keys(span.variants.gradient);
		let spanGradient = "none";
		let spanHighlight = "none";
		const highlights = Object.keys(span.variants.highlight);
		let spanDecoration = "none";
		const decorations = Object.keys(span.variants.decoration);
		let spanDecorationColor = "none";
		const decorationColors = Object.keys(span.variants.decorationColor);
		let spanDecorationThickness = "0";
		const docrationThickness = Object.keys(span.variants.decorationThickness);
		let opacityClass = "";

		const changeOpacity = () => {
			opacityClass = opacityClass === "" ? "text-gray-600/50 dark:text-gray-500/50" : "";
			spanHighlight = "none";
			spanGradient = "none";
		};

		// let editableContent = $state('Click to edit content.')
		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (spanItalic) props.push(` italic`);
			if (spanUnderline) props.push(` underline`);
			if (spanLinethrough) props.push(` linethrough`);
			if (spanUppercase) props.push(` uppercase`);
			if (spanGradient !== "none") props.push(` gradient="${spanGradient}"`);
			if (spanHighlight !== "none") props.push(` highlight="${spanHighlight}"`);
			if (spanDecoration !== "none") props.push(` decoration="${spanDecoration}"`);
			if (spanDecorationColor !== "none") props.push(` decorationColor="${spanDecorationColor}"`);
			if (spanDecorationThickness !== "0") props.push(` decorationThickness="${spanDecorationThickness}"`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<P size="xl" weight="bold">
  Lorem ipsum 
  <Span${propsString}>${editableContent}</Span>
  consectetur elit.
</P>`;
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
					$$renderer.push(`<!---->Span Builder`);
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
						$$renderer.push(`<div class="h-40"><div class="mb-4">`);

						Label($$renderer, {
							class: 'mr-4 text-lg font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Edit span content:`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						{
							function right($$renderer) {
								CloseButton($$renderer, { onclick: () => editableContent = "" });
							}

							Input($$renderer, {
								type: 'text',
								placeholder: 'Write your blockquote text',
								class: 'mb-4 pr-12',
								get value() {
									return editableContent;
								},

								set value($$value) {
									editableContent = $$value;
									$$settled = false;
								},
								right,
								$$slots: { right: true }
							});
						}

						$$renderer.push(`<!----></div> `);

						P($$renderer, {
							size: 'xl',
							weight: 'bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Lorem ipsum `);

								Span($$renderer, {
									italic: spanItalic,
									underline: spanUnderline,
									linethrough: spanLinethrough,
									uppercase: spanUppercase,
									gradient: spanGradient,
									decoration: spanDecoration,
									decorationColor: spanDecorationColor,
									decorationThickness: spanDecorationThickness,
									highlight: spanHighlight,
									class: opacityClass,
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(editableContent)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> consectetur elit.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div class="mt-4 mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Highlight`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(highlights);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let highlight = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-20" },
								name: 'span_highlight',
								onchange: () => {
									spanGradient = "none";
									opacityClass = "";
								},
								color: highlight,
								value: highlight,
								get group() {
									return spanHighlight;
								},

								set group($$value) {
									spanHighlight = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(highlight)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Gradient`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(gradients);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let gradient = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-40" },
								name: 'span_gradient',
								onchange: () => spanHighlight = "none",
								value: gradient,
								get group() {
									return spanGradient;
								},

								set group($$value) {
									spanGradient = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(gradient)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Decoration thickness`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_2 = $.ensure_array_like(docrationThickness);

						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							let thickness = each_array_2[$$index_2];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-16" },
								name: 'span_decoration_thickness',
								onchange: () => {
									spanUnderline = false;
									spanLinethrough = false;
								},
								value: thickness,
								get group() {
									return spanDecorationThickness;
								},

								set group($$value) {
									spanDecorationThickness = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(thickness)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Decoration color`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_3 = $.ensure_array_like(decorationColors);

						for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
							let color = each_array_3[$$index_3];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'p_decoration_color',
								onchange: () => {
									spanUnderline = false;
									spanLinethrough = false;
								},
								color,
								value: color,
								get group() {
									return spanDecorationColor;
								},

								set group($$value) {
									spanDecorationColor = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(color)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Decoration`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_4 = $.ensure_array_like(decorations);

						for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
							let decoration = each_array_4[$$index_4];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-20" },
								name: 'span_decoration',
								onchange: () => {
									spanUnderline = false;
									spanLinethrough = false;
								},
								value: decoration,
								get group() {
									return spanDecoration;
								},

								set group($$value) {
									spanDecoration = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(decoration)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-36',
							color: 'violet',
							onclick: changeLinethrough,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(spanLinethrough ? "No linethrough" : "Linethrough ")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-36',
							color: 'blue',
							onclick: changeUppercase,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(spanUppercase ? "No uppercase" : "Uppercase")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-24',
							onclick: changeItalic,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(spanItalic ? "No italic" : "Italic")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-28',
							color: 'amber',
							onclick: changeUnderline,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(spanUnderline ? "No underline" : "Underline")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-32',
							color: 'teal',
							onclick: changeOpacity,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(opacityClass ? "No opacity" : "Add opacity")}`);
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
		$.bind_props($$props, { editableContent });
	});
}