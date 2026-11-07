import * as $ from 'svelte/internal/server';
import { goto } from "$app/navigation";
import Button from "$lib/components/ui/button/button.svelte";
import * as Command from "$lib/components/ui/command/index";
import { search_comp } from "$lib/config/search_comp";
import { cn } from "$lib/utils";
import Circle from "@lucide/svelte/icons/circle";
import { onMount } from "svelte";

export default function SearchComponent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;

		onMount(() => {
			function handleKeydown(e) {
				if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
					e.preventDefault();
					open = true;
				}
			}

			document.addEventListener("keydown", handleKeydown);

			return () => {
				document.removeEventListener("keydown", handleKeydown);
			};
		});

		function runCommand(cmd) {
			open = false;
			cmd();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, {
				variant: 'outline',
				class: cn("rounded-full text-muted-foreground md:w-40 lg:w-40"),
				onclick: () => open = true,
				size: 'sm',
				children: ($$renderer) => {
					$$renderer.push(`<span class="hidden lg:inline-flex">Search Component..</span> <span class="inline-flex lg:hidden">Search...</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Command.Dialog) {
				$$renderer.push('<!--[-->');

				Command.Dialog($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Command.Input) {
							$$renderer.push('<!--[-->');
							Command.Input($$renderer, { placeholder: 'Type a component name..' });
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
												$$renderer.push(`<!---->No results found.`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <!--[-->`);

									const each_array = $.ensure_array_like(search_comp);

									for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
										let navItem = each_array[$$index_1];

										if (Command.Group) {
											$$renderer.push('<!--[-->');

											Command.Group($$renderer, {
												heading: navItem.name,
												children: ($$renderer) => {
													$$renderer.push(`<!--[-->`);

													const each_array_1 = $.ensure_array_like(navItem.subcom);

													for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
														let item = each_array_1[$$index];

														if (Command.Item) {
															$$renderer.push('<!--[-->');

															Command.Item($$renderer, {
																class: 'capitalize',
																value: item.name,
																onSelect: () => runCommand(() => {
																	item.href && goto(item.href);
																}),

																children: ($$renderer) => {
																	$$renderer.push(`<div class="mr-2 flex h-4 w-4 items-center justify-center">`);
																	Circle($$renderer, { class: 'h-3 w-3' });
																	$$renderer.push(`<!----></div> ${$.escape(item.name)}`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}