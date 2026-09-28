import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Button from "$lib/registry/ui/button/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

const FileTreeItem = ($$anchor, $$arg0) => {
	let item = () => ($$arg0?.()).item;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
				Collapsible_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_2 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Button.Root, ($$anchor, Button_Root) => {
									Button_Root($$anchor, $.spread_props(
										{
											variant: 'ghost',
											size: 'sm',
											class: 'group w-full justify-start transition-none hover:bg-accent hover:text-accent-foreground'
										},
										props,
										{
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												IconPlaceholder(node_4, {
													lucide: 'ChevronRightIcon',
													tabler: 'IconChevronRight',
													hugeicons: 'ArrowRight01Icon',
													phosphor: 'CaretRightIcon',
													remixicon: 'RiArrowRightSLine',
													class: 'transition-transform group-data-[state=open]:rotate-90'
												});

												var node_5 = $.sibling(node_4, 2);

												IconPlaceholder(node_5, {
													lucide: 'FolderIcon',
													tabler: 'IconFolder',
													hugeicons: 'Folder01Icon',
													phosphor: 'FolderIcon',
													remixicon: 'RiFolderLine'
												});

												var text = $.sibling(node_5);

												$.template_effect(() => $.set_text(text, ` ${item().name ?? ''}`));
												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										}
									));
								});

								$.append($$anchor, fragment_3);
							};

							$.component(node_2, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
								Collapsible_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_6 = $.sibling(node_2, 2);

						$.component(node_6, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
							Collapsible_Content($$anchor, {
								class: 'mt-1 ml-5 style-lyra:ml-4',
								children: ($$anchor, $$slotProps) => {
									var div = root_1();

									$.each(div, 21, () => item().items, (subItem) => subItem.name, ($$anchor, subItem) => {
										FileTreeItem($$anchor, () => ({ item: $.get(subItem) }));
									});

									$.reset(div);
									$.append($$anchor, div);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_7 = $.first_child(fragment_6);

			$.component(node_7, () => Button.Root, ($$anchor, Button_Root_1) => {
				Button_Root_1($$anchor, {
					variant: 'link',
					size: 'sm',
					class: 'w-full justify-start gap-2 text-foreground',
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_3();
						var node_8 = $.first_child(fragment_7);

						IconPlaceholder(node_8, {
							lucide: 'FileIcon',
							tabler: 'IconFile',
							hugeicons: 'File01Icon',
							phosphor: 'FileIcon',
							remixicon: 'RiFileLine'
						});

						var span = $.sibling(node_8, 2);
						var text_1 = $.only_child(span, true);

						$.template_effect(() => $.set_text(text_1, item().name));
						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_6);
		};

		$.if(node, ($$render) => {
			if ("items" in item()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
};

var root = $.from_html(`<!> <!> `, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-1"></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <span> </span>`, 1);

export default function Collapsible_file_tree($$anchor) {
	const fileTree = [
		{
			name: "src",
			items: [
				{
					name: "lib",
					items: [
						{
							name: "components",
							items: [
								{ name: "Header.svelte" },
								{ name: "Footer.svelte" },
								{ name: "Navigation.svelte" },
								{ name: "Card.svelte" }
							]
						},
						{ name: "utils.ts" },
						{ name: "stores.ts" },
						{ name: "types.ts" }
					]
				},

				{
					name: "routes",
					items: [
						{
							name: "(app)",
							items: [
								{ name: "+layout.svelte" },
								{ name: "+page.svelte" },
								{ name: "about", items: [] },
								{ name: "contact", items: [] }
							]
						},
						{ name: "+layout.svelte" },
						{ name: "+page.svelte" },
						{ name: "+error.svelte" }
					]
				},
				{ name: "app.html" },
				{ name: "app.css" },
				{ name: "app.d.ts" },
				{ name: "hooks.server.ts" }
			]
		},

		{
			name: "static",
			items: [
				{ name: "favicon.png" },
				{ name: "robots.txt" },
				{ name: "images", items: [] }
			]
		},
		{ name: "package.json" },
		{ name: "svelte.config.js" },
		{ name: "vite.config.ts" },
		{ name: "tsconfig.json" },
		{ name: "README.md" },
		{ name: ".gitignore" }
	];

	Example($$anchor, {
		title: 'File Tree',
		class: 'items-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = $.comment();
			var node_9 = $.first_child(fragment_9);

			$.component(node_9, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'mx-auto w-full max-w-[16rem] gap-2',
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_10 = root_2();
						var node_10 = $.first_child(fragment_10);

						$.component(node_10, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = $.comment();
									var node_11 = $.first_child(fragment_11);

									$.component(node_11, () => Tabs.Root, ($$anchor, Tabs_Root) => {
										Tabs_Root($$anchor, {
											value: 'explorer',
											children: ($$anchor, $$slotProps) => {
												var fragment_12 = $.comment();
												var node_12 = $.first_child(fragment_12);

												$.component(node_12, () => Tabs.List, ($$anchor, Tabs_List) => {
													Tabs_List($$anchor, {
														class: 'w-full',
														children: ($$anchor, $$slotProps) => {
															var fragment_13 = root_2();
															var node_13 = $.first_child(fragment_13);

															$.component(node_13, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
																Tabs_Trigger($$anchor, {
																	value: 'explorer',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Explorer');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															var node_14 = $.sibling(node_13, 2);

															$.component(node_14, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
																Tabs_Trigger_1($$anchor, {
																	value: 'settings',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Outline');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_13);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_12);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});
						});

						var node_15 = $.sibling(node_10, 2);

						$.component(node_15, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var div_1 = root_1();

									$.each(div_1, 21, () => fileTree, (item) => item.name, ($$anchor, item) => {
										FileTreeItem($$anchor, () => ({ item: $.get(item) }));
									});

									$.reset(div_1);
									$.append($$anchor, div_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_10);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});
}