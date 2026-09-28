import * as $ from 'svelte/internal/server';
import * as FormPrimitive from 'formsnap';
import { Label } from '$lib/components/ui/label/index.js';
import { cn } from '$lib/utils.js';

export default function Form_label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			children,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function child($$renderer, { props }) {
					Label($$renderer, $.spread_props([
						props,
						{
							'data-slot': 'form-label',
							class: cn('data-[fs-error]:text-destructive', className),
							children: ($$renderer) => {
								children?.($$renderer);
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						}
					]));
				}

				if (FormPrimitive.Label) {
					$$renderer.push('<!--[-->');

					FormPrimitive.Label($$renderer, $.spread_props([
						restProps,
						{
							get ref() {
								return ref;
							},

							set ref($$value) {
								ref = $$value;
								$$settled = false;
							},
							child,
							$$slots: { child: true }
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}