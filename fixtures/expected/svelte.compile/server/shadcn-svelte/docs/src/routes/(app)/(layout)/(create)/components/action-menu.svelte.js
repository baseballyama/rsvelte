import * as $ from 'svelte/internal/server';
import { goto } from "$app/navigation";
import { page } from "$app/state";
import * as Command from "$lib/registry/ui/command/index.js";
import { examples } from "$lib/registry/examples/create/index.js";
import { ActionMenuContext, ActionMenuCtx } from "./action-menu-context.svelte.js";
import { groupItemsByType } from "../lib/utils.js";

export default function Action_menu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const actionMenuCtx = ActionMenuCtx.set(new ActionMenuContext());
		const commandPaletteExamples = $.derived(() => examples.filter((example) => !example.hideFromCommandPalette));
		const groupedItems = $.derived(() => groupItemsByType(commandPaletteExamples()));

		function handleKeydown(e) {
			if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				e.stopPropagation();
				actionMenuCtx.open = !actionMenuCtx.open;
			}
		}

		function handleSelect(itemName) {
			goto(`/create/${itemName}${page.url.search}`);
			actionMenuCtx.open = false;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Command.Dialog) {
				$$renderer.push('<!--[-->');

				Command.Dialog($$renderer, {
					value: page.params.item,
					class: 'animate-none!',
					get open() {
						return actionMenuCtx.open;
					},

					set open($$value) {
						actionMenuCtx.open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Command.Input) {
							$$renderer.push('<!--[-->');
							Command.Input($$renderer, { placeholder: 'Search' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Command.List) {
							$$renderer.push('<!--[-->');

							Command.List($$renderer, {
								children: ($$renderer) => {
									if (Command.Empty) {
										$$renderer.push('<!--[-->');

										Command.Empty($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->No items found.`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Command.Group) {
										$$renderer.push('<!--[-->');

										Command.Group($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(groupedItems());

												for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
													let group = each_array[$$index_1];

													$$renderer.push(`<!--[-->`);

													const each_array_1 = $.ensure_array_like(group.items);

													for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
														let item = each_array_1[$$index];

														if (Command.Item) {
															$$renderer.push('<!--[-->');

															Command.Item($$renderer, {
																value: item.name,
																onSelect: () => handleSelect(item.name),
																'data-checked': page.params.item === item.name,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(item.title)}`);
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

												$$renderer.push(`<!--]-->`);
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
			children?.($$renderer);
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