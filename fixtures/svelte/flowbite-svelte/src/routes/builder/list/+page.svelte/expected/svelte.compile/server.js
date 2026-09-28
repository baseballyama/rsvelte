import * as $ from 'svelte/internal/server';
import { List, list, Li, Heading, Label, Radio, Button, uiHelpers } from "$lib";
import { CheckCircleSolid } from "flowbite-svelte-icons";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "List builder";

		let description = "A quick way to create List component";
		let title = "List builder";
		let dir = "builder";
		const tags = Object.keys(list.variants.tag);
		let listTag = "ul";
		const positions = Object.keys(list.variants.position);
		let listPosition = "inside";
		let listIcon = false;

		const changeListIcon = () => {
			listIcon = !listIcon;

			if (listIcon) {
				nested = false;
			}
		};

		let ctxClass = "";

		const changeCtxClass = () => {
			ctxClass = ctxClass === "" ? "pl-8" : "";
		};

		let nested = false;

		const changeNested = () => {
			nested = !nested;

			if (nested) {
				listIcon = false;
			}
		};

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];
			let iconSlot;
			let liIcon;
			let nestedContent;

			if (listTag !== "ul") props.push(` tag="${listTag}"`);
			if (listPosition !== "inside") props.push(` position="${listPosition}"`);

			// if (linkClass) props.push(` class="${linkClass}"`);
			iconSlot = listIcon
				? `<CheckCircleSolid class="me-2 h-5 w-5 text-green-500 dark:text-green-400" />`
				: "";

			if (ctxClass) props.push(` ctxClass="${ctxClass}"`);

			liIcon = listIcon ? ` icon` : "";

			nestedContent = nested
				? `<List tag="ol" ctxClass="mt-2 space-y-1 ps-5">
      <Li>item 1-1</Li>
      <Li>item 1-2</Li>
      <Li>item 1-3</Li>
    </List>
      `
				: "";

			const propsString = props.length > 0
				? props.map((prop) => `\n  ${prop}`).join("") + "\n"
				: "";

			return `<List${propsString}>
  <Li${liIcon}>${iconSlot}Item 1${nestedContent}</Li>
  <Li${liIcon}>${iconSlot}Item 2</Li>
  <Li${liIcon}>${iconSlot}Item 3</Li>
</List>`;
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
					$$renderer.push(`<!---->List Builder`);
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
						Heading($$renderer, {
							tag: 'h2',
							class: 'mb-2 text-lg font-semibold text-gray-900 dark:text-white',
							children: ($$renderer) => {
								$$renderer.push(`<!---->List title`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						List($$renderer, {
							tag: listTag,
							position: listPosition,
							class: 'space-y-1 text-gray-500 dark:text-gray-400',
							ctxClass,
							children: ($$renderer) => {
								Li($$renderer, {
									icon: listIcon,
									children: ($$renderer) => {
										if (listIcon) {
											$$renderer.push('<!--[0-->');
											CheckCircleSolid($$renderer, { class: 'me-2 h-5 w-5 text-green-500 dark:text-green-400' });
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->At least 10 characters (and up to 100 characters) `);

										if (nested) {
											$$renderer.push('<!--[0-->');

											List($$renderer, {
												tag: 'ol',
												ctxClass: 'mt-2 space-y-1 ps-5',
												children: ($$renderer) => {
													Li($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->item 1-1`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Li($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->item 1-2`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Li($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->item 1-3`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!---->`);
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

								Li($$renderer, {
									icon: listIcon,
									children: ($$renderer) => {
										if (listIcon) {
											$$renderer.push('<!--[0-->');
											CheckCircleSolid($$renderer, { class: 'me-2 h-5 w-5 text-green-500 dark:text-green-400' });
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->At least one lowercase character`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Li($$renderer, {
									icon: listIcon,
									children: ($$renderer) => {
										if (listIcon) {
											$$renderer.push('<!--[0-->');
											CheckCircleSolid($$renderer, { class: 'me-2 h-5 w-5 text-green-500 dark:text-green-400' });
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->Inclusion of at least one special character, e.g., ! @ # ?`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <div class="mt-4 mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Tag`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(tags);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let tag = each_array[$$index];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-20" },
								name: 'list_tag',
								value: tag,
								get group() {
									return listTag;
								},

								set group($$value) {
									listTag = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(tag)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="mb-4 flex flex-wrap space-x-2">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Position`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array_1 = $.ensure_array_like(positions);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let position = each_array_1[$$index_1];

							Radio($$renderer, {
								class: 'my-1',
								classes: { label: "w-20" },
								name: 'list_position',
								value: position,
								get group() {
									return listPosition;
								},

								set group($$value) {
									listPosition = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(position)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap justify-center gap-2 md:justify-start">`);

						Button($$renderer, {
							class: 'w-48',
							color: 'blue',
							onclick: changeListIcon,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(listIcon ? "Remove icon" : "Add icon")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-48',
							color: 'rose',
							onclick: changeCtxClass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(ctxClass !== "" ? "Remove ctxClass" : "Add ctxClass")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							class: 'w-48',
							color: 'teal',
							onclick: changeNested,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(nested ? "Remove nested" : "Add nested")}`);
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