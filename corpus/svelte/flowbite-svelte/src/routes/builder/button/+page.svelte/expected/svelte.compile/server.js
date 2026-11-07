import * as $ from 'svelte/internal/server';

import {
	Button,
	GradientButton,
	gradientButton,
	button,
	Radio,
	Label,
	uiHelpers
} from "$lib";

import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import H2 from "../utils/H2.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import { capitalizeFirstLetter } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Button builder";

		let description = "A quick way to create Button component";
		let title = "Button builder";
		let dir = "builder";

		// color, size, group, outline, shadow, disabled, pill
		const btnColors = Object.keys(button.variants.color);

		let btnColor = "primary";
		let btnClass = "";

		const changeBtnClass = () => {
			btnClass = btnClass === "" ? "w-48" : "";
		};

		let btnLink = "";

		const changeBtnLink = () => {
			btnLink = btnLink === "" ? "/" : "";
		};

		let btnOutline = false;

		const changeBtnOutline = () => {
			btnOutline = !btnOutline;
		};

		let btnShadow = false;

		const changeBtnShadow = () => {
			btnShadow = !btnShadow;
		};

		let btnPill = false;

		const changeBtnPill = () => {
			btnPill = !btnPill;
		};

		let btnDisabled = false;

		const changeBtnDisabled = () => {
			btnDisabled = !btnDisabled;
		};

		const btnSizes = Object.keys(button.variants.size);
		let btnSize = "md";
		const gradientColors = Object.keys(gradientButton.variants.color);
		let gradientColor = "blue";
		const gradientSizes = Object.keys(button.variants.size);
		let gradientSize = "md";
		let gradientClass = "";

		const changeGradientClass = () => {
			gradientClass = gradientClass === "" ? "w-48" : "";
		};

		let gradientOutline = false;

		const changeGradientOutline = () => {
			gradientOutline = !gradientOutline;
		};

		let gradientShadow = false;

		const changeGradientShadow = () => {
			gradientShadow = !gradientShadow;
		};

		let graidentPill = false;

		const changeGradientPill = () => {
			graidentPill = !graidentPill;
		};

		let gradientDisabled = false;

		const changeGradientDisabled = () => {
			gradientDisabled = !gradientDisabled;
		};

		let gradientLink = "";

		const changeGradientLink = () => {
			gradientLink = gradientLink === "" ? "/" : "";
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (btnColor !== "primary") props.push(` color="${btnColor}"`);
			if (btnShadow) props.push(" shadow");
			if (btnOutline) props.push(" outline");
			if (btnPill) props.push(" pill");
			if (btnClass) props.push(` class="${btnClass}"`);
			if (btnLink) props.push(` href="${btnLink}"`);
			if (btnDisabled) props.push(" disabled");
			if (btnSize !== "md") props.push(` size="${btnSize}"`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Button${propsString}>My Button</Button>`;
		})());

		let gradientGeneratedCode = $.derived(() => (() => {
			let props = [];

			if (gradientColor !== "blue") props.push(` color="${gradientColor}"`);
			if (gradientShadow) props.push(" shadow");
			if (gradientOutline) props.push(" outline");
			if (graidentPill) props.push(" pill");
			if (gradientClass) props.push(` class="${gradientClass}"`);
			if (gradientLink) props.push(` href="${gradientLink}"`);
			if (gradientDisabled) props.push(" disabled");
			if (gradientSize !== "md") props.push(` size="${gradientSize}"`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<GradientButton${propsString}>My Gradient Button</GradientButton>`;
		})());

		// for interactive builder
		let builder = uiHelpers();

		let builderExpand = false;
		let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow(generatedCode()));

		const handleBuilderExpandClick = () => {
			builderExpand = !builderExpand;
		};

		// gradient button
		let gradientBuilderExpand = false;

		let showGradientBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow(gradientGeneratedCode()));

		const handleGradientBuilderExpandClick = () => {
			gradientBuilderExpand = !gradientBuilderExpand;
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MetaTag($$renderer, { breadcrumb_title, description, title, dir });
			$$renderer.push(`<!----> `);

			H1($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Button Builder`);
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
					innerClass: 'flex flex-wrap gap-2',
					codeblock,
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-16">`);

						Button($$renderer, {
							color: btnColor,
							class: btnClass,
							outline: btnOutline,
							shadow: btnShadow,
							pill: btnPill,
							disabled: btnDisabled,
							size: btnSize,
							href: btnLink ? btnLink : "",
							children: ($$renderer) => {
								$$renderer.push(`<!---->Button`);
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

						const each_array = $.ensure_array_like(btnColors);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let colorOption = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'btn_color',
								color: colorOption,
								value: colorOption,
								get group() {
									return btnColor;
								},

								set group($$value) {
									btnColor = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(colorOption)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Size`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(btnSizes);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let sizeOption = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'btn_size',
								value: sizeOption,
								get group() {
									return btnSize;
								},

								set group($$value) {
									btnSize = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(sizeOption)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-40',
							color: 'blue',
							onclick: changeBtnOutline,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(btnOutline === false ? "Add outline" : "Remove outline")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'green',
							onclick: changeBtnShadow,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(btnShadow === false ? "Add shadow" : "Remove shadow")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'yellow',
							onclick: changeBtnPill,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(btnPill === false ? "Add pill" : "Remove pill")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'red',
							onclick: changeBtnDisabled,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(btnDisabled === false ? "Add disabled" : "Remove disabled")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							onclick: changeBtnClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(btnClass === "" ? "Add class" : "Remove class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'sky',
							onclick: changeBtnLink,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(btnLink === "" ? "Add link" : "Remove link")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { codeblock: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			H2($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Interactive Gradient Button Builder`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function codeblock($$renderer) {
					DynamicCodeBlockHighlight($$renderer, {
						handleExpandClick: handleGradientBuilderExpandClick,
						expand: gradientBuilderExpand,
						showExpandButton: showGradientBuilderExpandButton(),
						code: gradientGeneratedCode()
					});
				}

				CodeWrapper($$renderer, {
					codeblock,
					children: ($$renderer) => {
						$$renderer.push(`<div class="h-16">`);

						GradientButton($$renderer, {
							outline: gradientOutline,
							shadow: gradientShadow,
							pill: graidentPill,
							class: gradientClass,
							disabled: gradientDisabled,
							color: gradientColor,
							size: gradientSize,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(capitalizeFirstLetter(gradientColor))}`);
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

						const each_array_2 = $.ensure_array_like(gradientColors);

						for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
							let colorOption = each_array_2[$$index_2];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-32" },
								name: 'gradient_color',
								value: colorOption,
								get group() {
									return gradientColor;
								},

								set group($$value) {
									gradientColor = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(colorOption)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Size`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_3 = $.ensure_array_like(gradientSizes);

						for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
							let sizeOption = each_array_3[$$index_3];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'gradient_size',
								value: sizeOption,
								get group() {
									return gradientSize;
								},

								set group($$value) {
									gradientSize = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(sizeOption)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-40',
							color: 'blue',
							onclick: changeGradientOutline,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(gradientOutline === false ? "Add outline" : "Remove outline")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'green',
							onclick: changeGradientShadow,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(gradientShadow === false ? "Add shadow" : "Remove shadow")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'yellow',
							onclick: changeGradientPill,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(graidentPill === false ? "Add pill" : "Remove pill")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'red',
							onclick: changeGradientDisabled,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(gradientDisabled === false ? "Add disabled" : "Remove disabled")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							onclick: changeGradientClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(gradientClass === "" ? "Add class" : "Remove class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'sky',
							onclick: changeGradientLink,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(btnLink === "" ? "Add link" : "Remove link")}`);
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