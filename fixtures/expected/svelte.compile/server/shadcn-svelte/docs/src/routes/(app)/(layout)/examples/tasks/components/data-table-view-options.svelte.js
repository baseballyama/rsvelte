import * as $ from 'svelte/internal/server';
import Settings2Icon from "@lucide/svelte/icons/settings-2";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";

export default function Data_table_view_options($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { table } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						if (DropdownMenu.Trigger) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Trigger($$renderer, {
								class: buttonVariants({
									variant: "outline",
									size: "sm",
									class: "ms-auto hidden h-8 lg:flex"
								}),

								children: ($$renderer) => {
									Settings2Icon($$renderer, {});
									$$renderer.push(`<!----> View`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (DropdownMenu.Content) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Content($$renderer, {
								children: ($$renderer) => {
									if (DropdownMenu.Group) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (DropdownMenu.Label) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Label($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Toggle columns`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (DropdownMenu.Separator) {
													$$renderer.push('<!--[-->');
													DropdownMenu.Separator($$renderer, {});
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` <!--[-->`);

												const each_array = $.ensure_array_like(table.getAllColumns().filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide()));

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let column = each_array[$$index];
													var bind_get = () => column.getIsVisible();
													var bind_set = (v) => column.toggleVisibility(!!v);

													if (DropdownMenu.CheckboxItem) {
														$$renderer.push('<!--[-->');

														DropdownMenu.CheckboxItem($$renderer, {
															get checked() {
																return bind_get();
															},

															set checked($$value) {
																bind_set($$value);
															},
															class: 'capitalize',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(column.id)}`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}