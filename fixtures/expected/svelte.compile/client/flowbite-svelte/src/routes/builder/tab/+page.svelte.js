import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs, tabs, TabItem, uiHelpers, Label, Radio } from "$lib";
import DynamicCodeBlockHighlight from "../utils/DynamicCodeBlockHighlight.svelte";
import CodeWrapper from "../utils/CodeWrapper.svelte";
import H1 from "../utils/H1.svelte";
import { isGeneratedCodeOverflow } from "../utils/helpers";
import MetaTag from "../../utils/MetaTag.svelte";

var root = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Profile:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_1 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Settings:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_2 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Users:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_3 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Dashboard:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_4 = $.from_html(`<span class="text-gray-400 dark:text-gray-500">Disabled</span>`);
var root_5 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Disabled:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_6 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <div class="my-4 flex flex-wrap space-x-4"><!> <!></div>`, 1);
var root_8 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// MetaTag
	let breadcrumb_title = "Tab builder";

	let description = "A quick way to create Tab component";
	let title = "Tab builder";
	let dir = "builder";
	let tabStyle = $.state("none");
	const tabStyles = Object.keys(tabs.variants.tabStyle);

	// code generator
	let generatedCode = $.derived(() => (() => {
		let props = [];

		if ($.get(tabStyle) !== "none") props.push(` style="${$.get(tabStyle)}"`);

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

	let builderExpand = $.state(false);
	let showBuilderExpandButton = $.derived(() => isGeneratedCodeOverflow($.get(generatedCode)));

	const handleBuilderExpandClick = () => {
		$.set(builderExpand, !$.get(builderExpand));
	};

	$.user_effect(() => {
		$.set(builderExpand, builder.isOpen, true);
	});

	var fragment = root_8();
	var node = $.first_child(fragment);

	MetaTag(node, { breadcrumb_title, description, title, dir });

	var node_1 = $.sibling(node, 2);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Tab Builder');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	{
		const codeblock = ($$anchor) => {
			DynamicCodeBlockHighlight($$anchor, {
				handleExpandClick: handleBuilderExpandClick,
				get expand() {
					return $.get(builderExpand);
				},

				get showExpandButton() {
					return $.get(showBuilderExpandButton);
				},

				get code() {
					return $.get(generatedCode);
				}
			});
		};

		CodeWrapper(node_2, {
			codeblock,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_7();
				var node_3 = $.first_child(fragment_2);

				{
					let $0 = $.derived(() => $.get(tabStyle) === "full"
						? "flex flex-nowrap rounded-lg divide-x rtl:divide-x-reverse divide-gray-200 shadow dark:divide-gray-700 space-x-0"
						: "");

					Tabs(node_3, {
						get tabStyle() {
							return $.get(tabStyle);
						},

						get ulClass() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_6();
							var node_4 = $.first_child(fragment_3);

							{
								const titleSlot = ($$anchor) => {
									$.next();

									var text_1 = $.text('Profile');

									$.append($$anchor, text_1);
								};

								let $0 = $.derived(() => $.get(tabStyle) === "full" ? "" : "Profile");
								let $1 = $.derived(() => $.get(tabStyle) === "full" ? "w-full" : "");

								TabItem(node_4, {
									open: true,
									get title() {
										return $.get($0);
									},

									get class() {
										return $.get($1);
									},
									titleSlot,
									children: ($$anchor, $$slotProps) => {
										var p = root();

										$.append($$anchor, p);
									},
									$$slots: { titleSlot: true, default: true }
								});
							}

							var node_5 = $.sibling(node_4, 2);

							{
								const titleSlot = ($$anchor) => {
									$.next();

									var text_2 = $.text('Settings');

									$.append($$anchor, text_2);
								};

								let $0 = $.derived(() => $.get(tabStyle) === "full" ? "" : "Settings");
								let $1 = $.derived(() => $.get(tabStyle) === "full" ? "w-full" : "");

								TabItem(node_5, {
									get title() {
										return $.get($0);
									},

									get class() {
										return $.get($1);
									},
									titleSlot,
									children: ($$anchor, $$slotProps) => {
										var p_1 = root_1();

										$.append($$anchor, p_1);
									},
									$$slots: { titleSlot: true, default: true }
								});
							}

							var node_6 = $.sibling(node_5, 2);

							{
								const titleSlot = ($$anchor) => {
									$.next();

									var text_3 = $.text('Users');

									$.append($$anchor, text_3);
								};

								let $0 = $.derived(() => $.get(tabStyle) === "full" ? "" : "Users");
								let $1 = $.derived(() => $.get(tabStyle) === "full" ? "w-full" : "");

								TabItem(node_6, {
									get title() {
										return $.get($0);
									},

									get class() {
										return $.get($1);
									},
									titleSlot,
									children: ($$anchor, $$slotProps) => {
										var p_2 = root_2();

										$.append($$anchor, p_2);
									},
									$$slots: { titleSlot: true, default: true }
								});
							}

							var node_7 = $.sibling(node_6, 2);

							{
								const titleSlot = ($$anchor) => {
									$.next();

									var text_4 = $.text('Dashboard');

									$.append($$anchor, text_4);
								};

								let $0 = $.derived(() => $.get(tabStyle) === "full" ? "" : "Dashboard");
								let $1 = $.derived(() => $.get(tabStyle) === "full" ? "w-full" : "");

								TabItem(node_7, {
									get title() {
										return $.get($0);
									},

									get class() {
										return $.get($1);
									},
									titleSlot,
									children: ($$anchor, $$slotProps) => {
										var p_3 = root_3();

										$.append($$anchor, p_3);
									},
									$$slots: { titleSlot: true, default: true }
								});
							}

							var node_8 = $.sibling(node_7, 2);

							{
								const titleSlot = ($$anchor) => {
									var span = root_4();

									$.append($$anchor, span);
								};

								let $0 = $.derived(() => $.get(tabStyle) === "full" ? "" : "Disabled");
								let $1 = $.derived(() => $.get(tabStyle) === "full" ? "w-full" : "");

								TabItem(node_8, {
									disabled: true,
									get title() {
										return $.get($0);
									},

									get class() {
										return $.get($1);
									},
									titleSlot,
									children: ($$anchor, $$slotProps) => {
										var p_4 = root_5();

										$.append($$anchor, p_4);
									},
									$$slots: { titleSlot: true, default: true }
								});
							}

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				}

				var div = $.sibling(node_3, 2);
				var node_9 = $.child(div);

				Label(node_9, {
					class: 'mb-4 w-full font-bold',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Style');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				$.each(node_10, 17, () => tabStyles, $.index, ($$anchor, option) => {
					var fragment_4 = $.comment();
					var node_11 = $.first_child(fragment_4);

					{
						var consequent = ($$anchor) => {
							Radio($$anchor, {
								class: 'my-1',
								classes: { label: "w-24" },
								name: 'table_color',
								get value() {
									return $.get(option);
								},

								get group() {
									return $.get(tabStyle);
								},

								set group($$value) {
									$.set(tabStyle, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text();

									$.template_effect(() => $.set_text(text_6, $.get(option)));
									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});
						};

						$.if(node_11, ($$render) => {
							if ($.get(option) !== "full") $$render(consequent);
						});
					}

					$.append($$anchor, fragment_4);
				});

				$.reset(div);
				$.append($$anchor, fragment_2);
			},
			$$slots: { codeblock: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}