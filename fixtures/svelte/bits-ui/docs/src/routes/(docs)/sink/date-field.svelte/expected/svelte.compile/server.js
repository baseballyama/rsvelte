import * as $ from 'svelte/internal/server';
import { DateField } from "bits-ui";

export default function Date_field($$renderer) {
	if (DateField.Root) {
		$$renderer.push('<!--[-->');

		DateField.Root($$renderer, {
			children: ($$renderer) => {
				{
					function children($$renderer, { segments }) {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(segments);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let { part, value } = each_array[i];

							$$renderer.push(`<div class="inline-block select-none">`);

							if (part === "literal") {
								$$renderer.push('<!--[0-->');

								if (DateField.Segment) {
									$$renderer.push('<!--[-->');

									DateField.Segment($$renderer, {
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

								if (DateField.Segment) {
									$$renderer.push('<!--[-->');

									DateField.Segment($$renderer, {
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

					if (DateField.Input) {
						$$renderer.push('<!--[-->');

						DateField.Input($$renderer, {
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
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}