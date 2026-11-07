import * as $ from 'svelte/internal/server';
import "../../app.css";
import { Select } from "bits-ui";
import { generateTestId } from "../helpers/select";

export default function Select_viewport_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items,
			value = "",
			open = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, $.spread_props([
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
										$$renderer.push(`<!---->Open Listbox`);
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
													if (Select.Viewport) {
														$$renderer.push('<!--[-->');

														Select.Viewport($$renderer, {
															'data-testid': 'viewport',
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array = $.ensure_array_like(items);

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let { value, label, disabled } = each_array[$$index];
																	const testId = generateTestId(value);

																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			disabled,
																			value,
																			label,
																			'data-testid': testId,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(label)}`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}