import * as $ from 'svelte/internal/server';
import { TimeRangeField } from "bits-ui";

export default function Time_range_field_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value,
			placeholder,
			startProps,
			endProps,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main><div data-testid="value">${$.escape(value)}</div> <div data-testid="start-value">${$.escape(value?.start?.toString())}</div> <div data-testid="end-value">${$.escape(value?.end?.toString())}</div> `);

			if (TimeRangeField.Root) {
				$$renderer.push('<!--[-->');

				TimeRangeField.Root($$renderer, $.spread_props([
					restProps,
					{
						'data-testid': 'root',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						get placeholder() {
							return placeholder;
						},

						set placeholder($$value) {
							placeholder = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (TimeRangeField.Label) {
								$$renderer.push('<!--[-->');

								TimeRangeField.Label($$renderer, {
									'data-testid': 'label',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Label`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <!--[-->`);

							const each_array = $.ensure_array_like(["start", "end"]);

							for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
								let type = each_array[$$index_1];
								const inputProps = type === "start" ? startProps : endProps;

								{
									function children($$renderer, { segments }) {
										$$renderer.push(`<!--[-->`);

										const each_array_1 = $.ensure_array_like(segments);

										for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
											let { part, value } = each_array_1[i];

											if (TimeRangeField.Segment) {
												$$renderer.push('<!--[-->');

												TimeRangeField.Segment($$renderer, {
													part,
													'data-testid': part === "literal" ? undefined : `${type}-${part}`,
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(value)}`);
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

									if (TimeRangeField.Input) {
										$$renderer.push('<!--[-->');

										TimeRangeField.Input($$renderer, $.spread_props([
											{ 'data-testid': `${$.stringify(type)}-input`, type },
											inputProps,
											{ children, $$slots: { default: true } }
										]));

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}
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