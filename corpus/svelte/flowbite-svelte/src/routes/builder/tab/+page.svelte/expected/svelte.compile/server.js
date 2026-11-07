import * as $ from 'svelte/internal/server';
import { Tabs, tabs, TabItem, uiHelpers, Label, Radio } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// MetaTag
		let breadcrumb_title = "Tab builder";

		let description = "A quick way to create Tab component";
		let title = "Tab builder";
		let dir = "builder";
		let tabStyle = "none";
		const tabStyles = Object.keys(tabs.variants.tabStyle);

		// code generator
		let generatedCode = $.derived(() => (() => {
			let props = [];

			if (tabStyle !== "none") props.push(` style="${tabStyle}"`);

			return `<Tab${props}>
  <TabItem open title="Profile">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        <b>Profile:</b>
        Tab content
      </p>
    </TabItem>
    <TabItem title="Dashboard">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        <b>Dashboard:</b>
        Tab content
      </p>
    </TabItem>
    <TabItem title="Settings">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        <b>Settings:</b>
        Tab content
      </p>
    </TabItem>
    <TabItem title="Users">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        <b>Users:</b>
        Tab content
      </p>
    </TabItem>
    <TabItem disabled>
      {#snippet titleSlot()}
        <span class="text-gray-400 dark:text-gray-500">Disabled</span>
      {/snippet}
      <p class="text-sm text-gray-500 dark:text-gray-400">
        <b>Disabled:</b>
        Tab content
      </p>
    </TabItem>    
</Tab>`;
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
					$$renderer.push(`<!---->Tab Builder`);
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
						Tabs($$renderer, {
							tabStyle,
							ulClass: tabStyle === "full"
								? "flex flex-nowrap rounded-lg divide-x rtl:divide-x-reverse divide-gray-200 shadow dark:divide-gray-700 space-x-0"
								: "",

							children: ($$renderer) => {
								{
									function titleSlot($$renderer) {
										$$renderer.push(`<!---->Profile`);
									}

									TabItem($$renderer, {
										open: true,
										title: tabStyle === "full" ? "" : "Profile",
										class: tabStyle === "full" ? "w-full" : "",
										titleSlot,
										children: ($$renderer) => {
											$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Profile:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
										},
										$$slots: { titleSlot: true, default: true }
									});
								}

								$$renderer.push(`<!----> `);

								{
									function titleSlot($$renderer) {
										$$renderer.push(`<!---->Settings`);
									}

									TabItem($$renderer, {
										title: tabStyle === "full" ? "" : "Settings",
										class: tabStyle === "full" ? "w-full" : "",
										titleSlot,
										children: ($$renderer) => {
											$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Settings:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
										},
										$$slots: { titleSlot: true, default: true }
									});
								}

								$$renderer.push(`<!----> `);

								{
									function titleSlot($$renderer) {
										$$renderer.push(`<!---->Users`);
									}

									TabItem($$renderer, {
										title: tabStyle === "full" ? "" : "Users",
										class: tabStyle === "full" ? "w-full" : "",
										titleSlot,
										children: ($$renderer) => {
											$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Users:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
										},
										$$slots: { titleSlot: true, default: true }
									});
								}

								$$renderer.push(`<!----> `);

								{
									function titleSlot($$renderer) {
										$$renderer.push(`<!---->Dashboard`);
									}

									TabItem($$renderer, {
										title: tabStyle === "full" ? "" : "Dashboard",
										class: tabStyle === "full" ? "w-full" : "",
										titleSlot,
										children: ($$renderer) => {
											$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Dashboard:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
										},
										$$slots: { titleSlot: true, default: true }
									});
								}

								$$renderer.push(`<!----> `);

								{
									function titleSlot($$renderer) {
										$$renderer.push(`<span class="text-gray-400 dark:text-gray-500">Disabled</span>`);
									}

									TabItem($$renderer, {
										disabled: true,
										title: tabStyle === "full" ? "" : "Disabled",
										class: tabStyle === "full" ? "w-full" : "",
										titleSlot,
										children: ($$renderer) => {
											$$renderer.push(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Disabled:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
										},
										$$slots: { titleSlot: true, default: true }
									});
								}

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <div class="my-4 flex flex-wrap space-x-4">`);

						Label($$renderer, {
							class: 'mb-4 w-full font-bold',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Style`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(tabStyles);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let option = each_array[$$index];

							if (option !== "full") {
								$$renderer.push('<!--[0-->');

								Radio($$renderer, {
									class: 'my-1',
									classes: { label: "w-24" },
									name: 'table_color',
									value: option,
									get group() {
										return tabStyle;
									},

									set group($$value) {
										tabStyle = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(option)}`);
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]--></div>`);
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