import * as $ from 'svelte/internal/server';
import "../../app.css";
import { Select } from "bits-ui";
import { generateTestId } from "../helpers/select";

export default function Select_value_child_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items = [],
			value = "",
			open = false,
			placeholder = "Open Listbox",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main data-testid="main">`);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, $.spread_props([
					{ items },
					restProps,
					{
						type: 'single',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Select.Trigger) {
								$$renderer.push('<!--[-->');

								Select.Trigger($$renderer, {
									'data-testid': 'trigger',
									children: ($$renderer) => {
										{
											function child(
												$$renderer,
												{ props, selection, placeholder: currentPlaceholder, disabled }
											) {
												$$renderer.push(`<span${$.attributes({ 'data-testid': 'value-node', ...props })}><span data-testid="selection-type">${$.escape(selection.type)}</span> <span data-testid="selection-value">${$.escape(selection.type === "single" && selection.selected ? selection.selected.value : "none")}</span> <span data-testid="selection-label">${$.escape(selection.type === "single" && selection.selected ? selection.selected.label : currentPlaceholder)}</span> <span data-testid="selection-disabled">${$.escape(disabled ? "true" : "false")}</span></span> <button type="button" data-testid="set-value-2">set value</button>`);
											}

											if (Select.Value) {
												$$renderer.push('<!--[-->');
												Select.Value($$renderer, { placeholder, child, $$slots: { child: true } });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
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

							if (Select.Portal) {
								$$renderer.push('<!--[-->');

								Select.Portal($$renderer, {
									children: ($$renderer) => {
										if (Select.Content) {
											$$renderer.push('<!--[-->');

											Select.Content($$renderer, {
												'data-testid': 'content',
												children: ($$renderer) => {
													if (Select.Group) {
														$$renderer.push('<!--[-->');

														Select.Group($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array = $.ensure_array_like(items);

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let item = each_array[$$index];

																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			'data-testid': generateTestId(item.value),
																			value: item.value,
																			label: item.label,
																			disabled: item.disabled,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(item.label)}`);
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
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}