import * as $ from 'svelte/internal/server';
import { TimeRangeField } from "bits-ui";

export default function Time_range_field_demo($$renderer) {
	if (TimeRangeField.Root) {
		$$renderer.push('<!--[-->');

		TimeRangeField.Root($$renderer, {
			class: 'group flex w-full max-w-[320px] flex-col gap-1.5',
			children: ($$renderer) => {
				if (TimeRangeField.Label) {
					$$renderer.push('<!--[-->');

					TimeRangeField.Label($$renderer, {
						class: 'block select-none text-sm font-medium',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Hotel dates`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <div class="h-input rounded-input border-border-input bg-background text-foreground focus-within:border-border-input-hover focus-within:shadow-date-field-focus hover:border-border-input-hover group-data-invalid:border-destructive flex w-full select-none items-center border px-2 py-3 text-sm tracking-[0.01em]"><!--[-->`);

				const each_array = $.ensure_array_like(["start", "end"]);

				for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
					let type = each_array[$$index_1];

					{
						function children($$renderer, { segments }) {
							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like(segments);

							for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
								let { part, value } = each_array_1[i];

								$$renderer.push(`<div class="inline-block select-none">`);

								if (part === "literal") {
									$$renderer.push('<!--[0-->');

									if (TimeRangeField.Segment) {
										$$renderer.push('<!--[-->');

										TimeRangeField.Segment($$renderer, {
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

									if (TimeRangeField.Segment) {
										$$renderer.push('<!--[-->');

										TimeRangeField.Segment($$renderer, {
											part,
											class: 'rounded-5px hover:bg-muted focus:bg-muted focus:text-foreground aria-[valuetext=Empty]:text-muted-foreground focus-visible:ring-0! focus-visible:ring-offset-0! px-1 py-1',
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

						if (TimeRangeField.Input) {
							$$renderer.push('<!--[-->');
							TimeRangeField.Input($$renderer, { type, children, $$slots: { default: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(` `);

					if (type === "start") {
						$$renderer.push(`<!--[0--><div aria-hidden="true" class="text-muted-foreground pl-1 pr-2">to</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}