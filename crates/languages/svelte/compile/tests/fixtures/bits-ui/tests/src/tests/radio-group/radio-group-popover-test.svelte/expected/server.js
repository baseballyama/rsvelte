import * as $ from 'svelte/internal/server';
import { Popover } from "bits-ui";
import { RadioGroup } from "bits-ui";

export default function Radio_group_popover_test($$renderer, $$props) {
	let { items, value = "", $$slots, $$events, ...restProps } = $$props;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main>`);

		if (Popover.Root) {
			$$renderer.push('<!--[-->');

			Popover.Root($$renderer, {
				children: ($$renderer) => {
					if (Popover.Trigger) {
						$$renderer.push('<!--[-->');

						Popover.Trigger($$renderer, {
							'data-testid': 'trigger',
							children: ($$renderer) => {
								$$renderer.push(`<!---->open`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Popover.Content) {
						$$renderer.push('<!--[-->');

						Popover.Content($$renderer, {
							'data-testid': 'content',
							children: ($$renderer) => {
								if (RadioGroup.Root) {
									$$renderer.push('<!--[-->');

									RadioGroup.Root($$renderer, $.spread_props([
										{ 'data-testid': 'root' },
										restProps,
										{
											get value() {
												return value;
											},

											set value($$value) {
												value = $$value;
												$$settled = false;
											},

											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(items);

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let { value, disabled } = each_array[$$index];

													{
														function children($$renderer, { checked }) {
															$$renderer.push(`<span${$.attr('data-testid', `${$.stringify(value)}-indicator`)}>${$.escape(checked)}</span> ${$.escape(value)}`);
														}

														if (RadioGroup.Item) {
															$$renderer.push('<!--[-->');

															RadioGroup.Item($$renderer, {
																id: value,
																value,
																disabled,
																'data-testid': `${$.stringify(value)}-item`,
																children,
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													$$renderer.push(` <label${$.attr('for', value)}${$.attr('data-testid', `${$.stringify(value)}-label`)}>Label for ${$.escape(value)}</label>`);
												}

												$$renderer.push(`<!--]-->`);
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

		$$renderer.push(` <div data-testid="value">${$.escape(value)}</div></main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}