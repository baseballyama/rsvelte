import * as $ from 'svelte/internal/server';

import {
	ButtonGroup,
	buttonGroup,
	Button,
	button,
	Label,
	Radio,
	uiHelpers
} from "$lib";

import { UserCircleSolid, AdjustmentsVerticalSolid, DownloadSolid } from "flowbite-svelte-icons";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Button group builder";

		let description = "A quick way to create Button group component";
		let title = "Button group builder";
		let dir = "builder";

		// size, class
		const sizes = Object.keys(buttonGroup.variants.size);

		let size = "md";

		// button colors
		const colors = Object.keys(button.variants.color);

		let color = "primary";
		let link = "";

		const changeLink = () => {
			link = link === "" ? "/" : "";
		};

		let icon = false;

		const changeIcon = () => {
			icon = !icon;
		};

		let outline = false;

		const changeOutline = () => {
			outline = !outline;
		};

		let buttonGroupClass = "";

		const changeClass = () => {
			buttonGroupClass = buttonGroupClass === "" ? "ml-4" : "";
		};

		let generatedCode = $.derived(() => (() => {
			let props = [];
			let btnProps = [];
			let icon1 = icon ? '<UserCircleSolid class="me-2 h-4 w-4" />' : "";

			let icon2 = icon
				? '<AdjustmentsVerticalSolid class="me-2 h-4 w-4" />'
				: "";

			let icon3 = icon ? '<DownloadSolid class="me-2 h-4 w-4" />' : "";

			if (size !== "md") props.push(` size="${size}"`);
			if (buttonGroupClass !== "") props.push(` class="${buttonGroupClass}"`);
			if (link) btnProps.push(` href="${link}"`);
			if (color !== "primary") btnProps.push(` color="${color}"`);
			if (outline) btnProps.push(" outline");

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<ButtonGroup${propsString}>
  <Button${btnProps}>${icon1}Profile</Button>
  <Button${btnProps}>${icon2}Settings</Button>
  <Button${btnProps}>${icon3}Messages</Button>
</ButtonGroup>`;
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
					$$renderer.push(`<!---->Button-group Builder`);
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
						$$renderer.push(`<div class="flex h-16 items-center justify-center">`);

						ButtonGroup($$renderer, {
							size,
							class: buttonGroupClass,
							children: ($$renderer) => {
								Button($$renderer, {
									color,
									href: link,
									outline,
									children: ($$renderer) => {
										if (icon) {
											$$renderer.push('<!--[0-->');
											UserCircleSolid($$renderer, { class: 'me-2 h-4 w-4' });
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->Profile`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									color,
									href: link,
									outline,
									children: ($$renderer) => {
										if (icon) {
											$$renderer.push('<!--[0-->');
											AdjustmentsVerticalSolid($$renderer, { class: 'me-2 h-4 w-4' });
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->Settings`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									color,
									href: link,
									outline,
									children: ($$renderer) => {
										if (icon) {
											$$renderer.push('<!--[0-->');
											DownloadSolid($$renderer, { class: 'me-2 h-4 w-4' });
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->Messages`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
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
							let sizeOption = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'size',
								value: sizeOption,
								get group() {
									return size;
								},

								set group($$value) {
									size = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(sizeOption)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

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

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-40',
							onclick: changeClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(buttonGroupClass ? "Remove class" : "Add class")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'secondary',
							onclick: changeLink,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(link === "" ? "Add link" : "Remove link")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'red',
							onclick: changeIcon,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(icon ? "Remove icon" : "Add icon")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-40',
							color: 'violet',
							onclick: changeOutline,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(outline ? "Remove outline" : "Add outline")}`);
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