import * as $ from 'svelte/internal/server';

import {
	A,
	Button,
	anchor,
	Label,
	Radio,
	Input,
	CloseButton,
	uiHelpers
} from "$lib";

import { ArrowRightOutline } from "flowbite-svelte-icons";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Link builder";

		let description = "A quick way to create Link component";
		let title = "Link builder";
		let dir = "builder";

		// for Props table
		// import CompoAttributesViewer from '../utils/CompoAttributesViewer.svelte';
		let { text = "Read more" } = $$props;

		const colors = Object.keys(anchor.variants.color);
		let anchorColor = "primary";
		let linkClass = "font-medium hover:underline";

		const changeLinkClass = () => {
			linkClass = linkClass === "font-medium hover:underline"
				? "underline hover:no-underline italic font-semibold"
				: "font-medium hover:underline";
		};

		let linkIcon = false;

		const changeIcon = () => {
			linkIcon = !linkIcon;
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];
			let iconSlot;

			props.push(` href="/"`);

			if (anchorColor !== "primary") props.push(` color="${anchorColor}"`);
			if (linkClass) props.push(` class="${linkClass}"`);

			iconSlot = linkIcon ? `\n  <ArrowRightOutline class="ms-2 h-6 w-6" />` : "";

			// if (imgAlignment !== 'left') props.push(` alignment="${imgAlignment}"`);
			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<A${propsString}>
  ${text} ${iconSlot}
</A>`;
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
					$$renderer.push(`<!---->Link Builder`);
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
						Label($$renderer, {
							class: 'text-md mb-2',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Edit link`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						{
							function right($$renderer) {
								CloseButton($$renderer, { onclick: () => text = "" });
							}

							Input($$renderer, {
								type: 'text',
								placeholder: 'Write your blockquote text',
								class: 'mb-4 pr-12',
								get value() {
									return text;
								},

								set value($$value) {
									text = $$value;
									$$settled = false;
								},
								right,
								$$slots: { right: true }
							});
						}

						$$renderer.push(`<!----> <div class="mb-4 md:h-10">`);

						A($$renderer, {
							href: '/',
							color: anchorColor,
							class: linkClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(text)} `);

								if (linkIcon) {
									$$renderer.push('<!--[0-->');
									ArrowRightOutline($$renderer, { class: 'ms-2 h-6 w-6' });
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
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
								name: 'anchor_color',
								color: colorOption,
								value: colorOption,
								get group() {
									return anchorColor;
								},

								set group($$value) {
									anchorColor = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(colorOption)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-36',
							color: 'blue',
							onclick: changeLinkClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(linkClass === "font-medium hover:underline" ? "Change class" : "Remove class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-36',
							color: 'pink',
							onclick: changeIcon,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(linkIcon ? "Remove icon" : "Add icon")}`);
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
		$.bind_props($$props, { text });
	});
}