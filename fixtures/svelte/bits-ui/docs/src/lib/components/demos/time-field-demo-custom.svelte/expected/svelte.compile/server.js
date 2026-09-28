import * as $ from 'svelte/internal/server';
import { TimeField } from "bits-ui";

export default function Time_field_demo_custom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			labelText = "Select a time",
			value = void 0,
			placeholder = void 0,
			name,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (TimeField.Root) {
				$$renderer.push('<!--[-->');

				TimeField.Root($$renderer, $.spread_props([
					restProps,
					{
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
							$$renderer.push(`<div class="flex w-fit min-w-[280px] flex-col gap-1.5">`);

							if (TimeField.Label) {
								$$renderer.push('<!--[-->');

								TimeField.Label($$renderer, {
									class: 'block select-none text-sm font-medium',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(labelText)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							{
								function children($$renderer, { segments }) {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(segments);

									for (let i = 0, $$length = each_array.length; i < $$length; i++) {
										let { part, value } = each_array[i];

										$$renderer.push(`<div class="inline-block select-none">`);

										if (part === "literal") {
											$$renderer.push('<!--[0-->');

											if (TimeField.Segment) {
												$$renderer.push('<!--[-->');

												TimeField.Segment($$renderer, {
													part,
													class: 'text-muted-foreground p-1',
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
										} else {
											$$renderer.push('<!--[-1-->');

											if (TimeField.Segment) {
												$$renderer.push('<!--[-->');

												TimeField.Segment($$renderer, {
													part,
													class: 'rounded-5px hover:bg-muted focus:bg-muted focus:text-foreground aria-[valuetext=Empty]:text-muted-foreground data-invalid:text-destructive focus-visible:ring-0! focus-visible:ring-offset-0! px-1 py-1',
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

										$$renderer.push(`<!--]--></div>`);
									}

									$$renderer.push(`<!--]-->`);
								}

								if (TimeField.Input) {
									$$renderer.push('<!--[-->');

									TimeField.Input($$renderer, {
										name,
										class: 'h-input rounded-input border-border-input bg-background text-foreground focus-within:border-border-input-hover focus-within:shadow-date-field-focus hover:border-border-input-hover data-invalid:border-destructive flex w-full select-none items-center border px-2 py-3 text-sm tracking-[0.01em] ',
										children,
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(`</div>`);
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
		$.bind_props($$props, { value, placeholder });
	});
}