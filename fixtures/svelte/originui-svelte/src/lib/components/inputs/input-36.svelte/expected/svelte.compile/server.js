import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import { useLocale } from '$lib/hooks/use-locale.svelte';
import { DateField } from 'bits-ui';

export default function Input_36($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const localeCtx = useLocale();

		$$renderer.push(`<div class="*:not-first:mt-2">`);

		Label($$renderer, {
			class: 'text-foreground text-sm font-medium',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Date input`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (DateField.Root) {
			$$renderer.push('<!--[-->');

			DateField.Root($$renderer, {
				locale: localeCtx.locale,
				children: ($$renderer) => {
					{
						function children($$renderer, { segments }) {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(segments);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let { part, value } = each_array[$$index];

								if (DateField.Segment) {
									$$renderer.push('<!--[-->');

									DateField.Segment($$renderer, {
										part,
										class: 'text-foreground focus:bg-accent focus:text-foreground aria-[valuetext=Empty]:text-muted-foreground/70 focus:aria-[valuetext=Empty]:text-foreground data-invalid:data-focused:bg-destructive data-invalid:text-destructive data-[segment=literal]:text-muted-foreground/70 data-invalid:focus:data-placeholder:text-destructive-foreground data-invalid:focus:text-destructive-foreground data-invalid:aria-[valuetext=Empty]:text-destructive inline rounded p-0.5 caret-transparent outline-0 outline-solid disabled:cursor-not-allowed disabled:opacity-50 data-[type=literal]:px-0',
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

						if (DateField.Input) {
							$$renderer.push('<!--[-->');

							DateField.Input($$renderer, {
								class: 'border-input bg-background ring-offset-background focus-within:border-ring focus-within:ring-ring/30 relative inline-flex h-9 w-full items-center overflow-hidden rounded-lg border px-3 py-2 text-sm whitespace-nowrap shadow-xs shadow-black/[.04] transition-shadow focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-hidden disabled:opacity-50',
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

		$$renderer.push(` <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Built with <a class="hover:text-foreground underline" href="https://next.bits-ui.com/docs/components/date-field" target="_blank" rel="noopener nofollow">Bits UI DateField</a></p></div>`);
	});
}