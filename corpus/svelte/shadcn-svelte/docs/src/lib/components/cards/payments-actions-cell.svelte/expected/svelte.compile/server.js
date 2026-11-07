import * as $ from 'svelte/internal/server';
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Payments_actions_cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row } = $$props;
		const payment = $.derived(() => row.original);

		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, {
				children: ($$renderer) => {
					{
						function child($$renderer, { props }) {
							Button($$renderer, $.spread_props([
								{ variant: 'ghost', class: 'size-8 p-0' },
								props,
								{
									children: ($$renderer) => {
										$$renderer.push(`<span class="sr-only">Open menu</span> `);
										EllipsisIcon($$renderer, {});
										$$renderer.push(`<!---->`);
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
							align: 'end',
							children: ($$renderer) => {
								if (DropdownMenu.Label) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Actions`);
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
										onclick: () => navigator.clipboard.writeText(payment().id),
										children: ($$renderer) => {
											$$renderer.push(`<!---->Copy payment ID`);
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
										children: ($$renderer) => {
											$$renderer.push(`<!---->View customer`);
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
										children: ($$renderer) => {
											$$renderer.push(`<!---->View payment details`);
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
	});
}