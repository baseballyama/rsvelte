import * as $ from 'svelte/internal/server';
import { Label, uiHelpers, Textarea, Button, Helper } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Textarea builder";

		let description = "A quick way to create Textarea component";
		let title = "Textarea builder";
		let dir = "builder";

		// props
		let value = "";

		const changeValue = () => {
			value = value !== ""
				? ""
				: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
		};

		let disabled = false;

		const changeDisabled = () => {
			disabled = !disabled;
		};

		let required = false;

		const changeRequired = () => {
			required = !required;
		};

		let placeholder = "";

		const changePlaceholder = () => {
			placeholder = placeholder !== "" ? "" : "Your message";

			value = placeholder !== ""
				? ""
				: "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
		};

		let rows = void 0;

		const changeRows = () => {
			rows = rows !== undefined ? undefined : 5;
		};

		let maxlength = void 0;

		const changeMaxlength = () => {
			maxlength = maxlength !== undefined ? undefined : 20;

			value = maxlength === 20
				? ""
				: "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
		};

		let textAreaClass = "";

		const changeClass = () => {
			textAreaClass = textAreaClass === "w-full" ? "w-48" : "w-full";
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (required) props.push(`required`);
			if (placeholder) props.push(`placeholder="${placeholder}"`);
			if (rows !== undefined) props.push(`rows="${rows}"`);
			if (maxlength) props.push(`maxlength="${maxlength}"`);
			if (textAreaClass) props.push(`class="${textAreaClass}"`);
			if (disabled) props.push(`disabled`);
			if (value) props.push(`value="${value}"`);

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<Textarea${propsString} />`;
		})());

		// end of code generator
		// for interactive builder
		let builder = uiHelpers();

		let builderExpand = false;
		let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow(generatedCode()));

		const handleBuilderExpandClick = () => {
			builderExpand = !builderExpand;
		};

		MetaTag($$renderer, { breadcrumb_title, description, title, dir });
		$$renderer.push(`<!----> `);

		H1($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Textarea Builder`);
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
					$$renderer.push(`<div class="mb-4 h-64">`);

					Label($$renderer, {
						for: 'textarea-id',
						class: 'mb-2',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Your message `);

							if (required) {
								$$renderer.push('<!--[0-->');

								Helper($$renderer, {
									color: 'red',
									class: 'inline',
									children: ($$renderer) => {
										$$renderer.push(`<!---->* Required`);
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Textarea($$renderer, {
						id: 'textarea-id',
						name: 'message',
						value,
						required,
						rows,
						maxlength,
						placeholder,
						class: textAreaClass,
						disabled
					});

					$$renderer.push(`<!----></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

					Button($$renderer, {
						class: 'w-48',
						color: 'blue',
						onclick: changeRequired,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(required ? "Remove required" : "Add required")}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						class: 'w-48',
						color: 'red',
						onclick: changePlaceholder,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(placeholder ? "Remove placeholder" : "Add placeholder")}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						class: 'w-48',
						color: 'yellow',
						onclick: changeRows,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(rows !== undefined ? "Remove rows" : "Add rows")}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						class: 'w-48',
						color: 'green',
						onclick: changeMaxlength,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(maxlength ? "Remove maxlength" : "Add maxlength")}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						class: 'w-48',
						color: 'pink',
						onclick: changeClass,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(textAreaClass === "w-full" ? "Use narrow width" : "Use full width")}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						class: 'w-48',
						color: 'purple',
						onclick: changeDisabled,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(disabled ? "Remove disabled" : "Add disabled")}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						class: 'w-48',
						color: 'orange',
						onclick: changeValue,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(value ? "Remove value" : "Add value")}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { codeblock: true, default: true }
			});
		}

		$$renderer.push(`<!---->`);
	});
}