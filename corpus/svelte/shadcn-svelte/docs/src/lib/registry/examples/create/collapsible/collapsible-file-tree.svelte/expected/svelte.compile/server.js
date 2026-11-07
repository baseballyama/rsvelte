import * as $ from 'svelte/internal/server';
import * as Button from "$lib/registry/ui/button/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

function FileTreeItem($$renderer, { item }) {
	if ("items" in item) {
		$$renderer.push('<!--[0-->');

		if (Collapsible.Root) {
			$$renderer.push('<!--[-->');

			Collapsible.Root($$renderer, {
				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							if (Button.Root) {
								$$renderer.push('<!--[-->');

								Button.Root($$renderer, $.spread_props([
									{
										variant: 'ghost',
										size: 'sm',
										class: 'group w-full justify-start transition-none hover:bg-accent hover:text-accent-foreground'
									},
									props,
									{
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'ChevronRightIcon',
												tabler: 'IconChevronRight',
												hugeicons: 'ArrowRight01Icon',
												phosphor: 'CaretRightIcon',
												remixicon: 'RiArrowRightSLine',
												class: 'transition-transform group-data-[state=open]:rotate-90'
											});

											$$renderer.push(`<!----> `);

											IconPlaceholder($$renderer, {
												lucide: 'FolderIcon',
												tabler: 'IconFolder',
												hugeicons: 'Folder01Icon',
												phosphor: 'FolderIcon',
												remixicon: 'RiFolderLine'
											});

											$$renderer.push(`<!----> ${$.escape(item.name)}`);
										},
										$$slots: { default: true }
									}
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						if (Collapsible.Trigger) {
							$$renderer.push('<!--[-->');
							Collapsible.Trigger($$renderer, { child, $$slots: { child: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(` `);

					if (Collapsible.Content) {
						$$renderer.push('<!--[-->');

						Collapsible.Content($$renderer, {
							class: 'mt-1 ml-5 style-lyra:ml-4',
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex flex-col gap-1"><!--[-->`);

								const each_array = $.ensure_array_like(item.items);

								for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
									let subItem = each_array[$$index_1];

									FileTreeItem($$renderer, { item: subItem });
								}

								$$renderer.push(`<!--]--></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	} else {
		$$renderer.push('<!--[-1-->');

		if (Button.Root) {
			$$renderer.push('<!--[-->');

			Button.Root($$renderer, {
				variant: 'link',
				size: 'sm',
				class: 'w-full justify-start gap-2 text-foreground',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'FileIcon',
						tabler: 'IconFile',
						hugeicons: 'File01Icon',
						phosphor: 'FileIcon',
						remixicon: 'RiFileLine'
					});

					$$renderer.push(`<!----> <span>${$.escape(item.name)}</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	$$renderer.push(`<!--]-->`);
}

export default function Collapsible_file_tree($$renderer) {
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

	Example($$renderer, {
		title: 'File Tree',
		class: 'items-center',
		children: ($$renderer) => {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'mx-auto w-full max-w-[16rem] gap-2',
					size: 'sm',
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Tabs.Root) {
										$$renderer.push('<!--[-->');

										Tabs.Root($$renderer, {
											value: 'explorer',
											children: ($$renderer) => {
												if (Tabs.List) {
													$$renderer.push('<!--[-->');

													Tabs.List($$renderer, {
														class: 'w-full',
														children: ($$renderer) => {
															if (Tabs.Trigger) {
																$$renderer.push('<!--[-->');

																Tabs.Trigger($$renderer, {
																	value: 'explorer',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Explorer`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Tabs.Trigger) {
																$$renderer.push('<!--[-->');

																Tabs.Trigger($$renderer, {
																	value: 'settings',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Outline`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex flex-col gap-1"><!--[-->`);

									const each_array_1 = $.ensure_array_like(fileTree);

									for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
										let item = each_array_1[$$index];

										FileTreeItem($$renderer, { item });
									}

									$$renderer.push(`<!--]--></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}