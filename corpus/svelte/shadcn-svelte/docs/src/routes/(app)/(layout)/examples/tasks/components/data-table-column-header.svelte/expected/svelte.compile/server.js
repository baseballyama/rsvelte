import * as $ from 'svelte/internal/server';
import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import EyeOffIcon from "@lucide/svelte/icons/eye-off";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Data_table_column_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			column,
			title,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (!column?.getCanSort()) {
			$$renderer.push(`<!--[0--><div${$.attributes({ class: $.clsx(className), ...restProps })}>${$.escape(title)}</div>`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({
				class: $.clsx(cn("flex items-center", className)),
				...restProps
			})}>`);

			if (DropdownMenu.Root) {
				$$renderer.push('<!--[-->');

				DropdownMenu.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'ghost',
										size: 'sm',
										class: '-ms-3 h-8 data-[state=open]:bg-accent',
										children: ($$renderer) => {
											$$renderer.push(`<span>${$.escape(title)}</span> `);

											if (column.getIsSorted() === "desc") {
												$$renderer.push('<!--[0-->');
												ArrowDownIcon($$renderer, {});
											} else if (column.getIsSorted() === "asc") {
												$$renderer.push('<!--[1-->');
												ArrowUpIcon($$renderer, {});
											} else {
												$$renderer.push('<!--[-1-->');
												ChevronsUpDownIcon($$renderer, {});
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (DropdownMenu.Trigger) {
								$$renderer.push('<!--[-->');
								DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (DropdownMenu.Content) {
							$$renderer.push('<!--[-->');

							DropdownMenu.Content($$renderer, {
								align: 'start',
								children: ($$renderer) => {
									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											onclick: () => column.toggleSorting(false),
											children: ($$renderer) => {
												ArrowUpIcon($$renderer, { class: 'me-2 size-3.5 text-muted-foreground/70' });
												$$renderer.push(`<!----> Asc`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											onclick: () => column.toggleSorting(true),
											children: ($$renderer) => {
												ArrowDownIcon($$renderer, { class: 'me-2 size-3.5 text-muted-foreground/70' });
												$$renderer.push(`<!----> Desc`);
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

									$$renderer.push(` `);

									if (DropdownMenu.Item) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Item($$renderer, {
											onclick: () => column.toggleVisibility(false),
											children: ($$renderer) => {
												EyeOffIcon($$renderer, { class: 'me-2 size-3.5 text-muted-foreground/70' });
												$$renderer.push(`<!----> Hide`);
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

			$$renderer.push(`</div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}