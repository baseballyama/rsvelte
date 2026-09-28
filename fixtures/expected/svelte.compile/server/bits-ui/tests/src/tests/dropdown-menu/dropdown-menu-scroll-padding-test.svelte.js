import * as $ from 'svelte/internal/server';
import { DropdownMenu } from "bits-ui";

export default function Dropdown_menu_scroll_padding_test($$renderer, $$props) {
	let { contentProps = {} } = $$props;
	const rows = Array.from({ length: 80 }, (_, i) => i + 1);

	$.head('y9wqh5', $$renderer, ($$renderer) => {
		$$renderer.push(`<style>
		:root {
			scroll-padding-top: 200px;
		}
	</style>`);
	});

	$$renderer.push(`<div data-testid="page"><!--[-->`);

	const each_array = $.ensure_array_like(rows);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let row = each_array[i];

		$$renderer.push(`<div style="height: 24px;">Row ${$.escape(row)}</div>`);
	}

	$$renderer.push(`<!--]--> `);

	if (DropdownMenu.Root) {
		$$renderer.push('<!--[-->');

		DropdownMenu.Root($$renderer, {
			children: ($$renderer) => {
				if (DropdownMenu.Trigger) {
					$$renderer.push('<!--[-->');

					DropdownMenu.Trigger($$renderer, {
						'data-testid': 'trigger',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Open`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (DropdownMenu.Portal) {
					$$renderer.push('<!--[-->');

					DropdownMenu.Portal($$renderer, {
						children: ($$renderer) => {
							if (DropdownMenu.Content) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Content($$renderer, $.spread_props([
									contentProps,
									{
										'data-testid': 'content',
										preventScroll: false,
										children: ($$renderer) => {
											if (DropdownMenu.Item) {
												$$renderer.push('<!--[-->');

												DropdownMenu.Item($$renderer, {
													'data-testid': 'item-1',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Item 1`);
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
													'data-testid': 'item-2',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Item 2`);
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
													'data-testid': 'item-3',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Item 3`);
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
									}
								]));

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

	$$renderer.push(` <!--[-->`);

	const each_array_1 = $.ensure_array_like(rows);

	for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
		let row = each_array_1[i];

		$$renderer.push(`<div style="height: 24px;">After row ${$.escape(row)}</div>`);
	}

	$$renderer.push(`<!--]--></div>`);
}