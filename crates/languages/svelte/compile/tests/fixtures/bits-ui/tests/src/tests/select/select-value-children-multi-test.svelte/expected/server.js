import * as $ from 'svelte/internal/server';
import "../../app.css";
import { Select } from "bits-ui";
import { generateTestId } from "../helpers/select";

export default function Select_value_children_multi_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items = [],
			value = [],
			open = false,
			placeholder = "Open combobox",
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
						type: 'multiple',
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
											function children(
												$$renderer,
												{ selection, placeholder: currentPlaceholder, disabled }
											) {
												$$renderer.push(`<span data-testid="selection-type">${$.escape(selection.type)}</span> <span data-testid="selection-values">${$.escape(selection.type === "multiple" && selection.selected.length > 0
													? selection.selected.map((v) => v.value).join(",")
													: "none")}</span> <span data-testid="selection-label">${$.escape(selection.type === "multiple" && selection.selected.length > 0
													? selection.selected.map((v) => v.label).join(", ")
													: currentPlaceholder)}</span> <span data-testid="selection-disabled">${$.escape(disabled ? "true" : "false")}</span> <button type="button" data-testid="set-values-1-3">set values</button>`);
											}

											if (Select.Value) {
												$$renderer.push('<!--[-->');
												Select.Value($$renderer, { placeholder, children, $$slots: { default: true } });
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