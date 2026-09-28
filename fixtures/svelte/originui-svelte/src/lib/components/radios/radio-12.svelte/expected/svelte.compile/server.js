import * as $ from 'svelte/internal/server';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';
import IconApple from '~icons/ri/apple-line';
import IconBankCard from '~icons/ri/bank-card-line';
import IconPaypal from '~icons/ri/paypal-line';

export default function Radio_12($$renderer) {
	const items = [
		{
			Icon: IconBankCard,
			id: 'radio-12-cc',
			label: 'Card',
			value: 'cc'
		},

		{
			Icon: IconPaypal,
			id: 'radio-12-paypal',
			label: 'PayPal',
			value: 'paypal'
		},

		{
			Icon: IconApple,
			id: 'radio-12-apple-pay',
			label: 'Apple Pay',
			value: 'apple-pay'
		}
	];

	let selectedValue = 'cc';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		RadioGroup($$renderer, {
			class: 'grid grid-cols-3 gap-2',
			get value() {
				return selectedValue;
			},

			set value($$value) {
				selectedValue = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					$$renderer.push(`<label class="border-input ring-offset-background has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent has-focus-visible:ring-ring/70 relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border px-2 py-3 text-center shadow-xs shadow-black/[.04] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-offset-2">`);

					RadioGroupItem($$renderer, {
						id: item.id,
						value: item.value,
						class: 'sr-only after:absolute after:inset-0'
					});

					$$renderer.push(`<!----> `);

					if (item.Icon) {
						$$renderer.push('<!--[-->');

						item.Icon($$renderer, {
							class: 'opacity-60',
							width: '20',
							height: '20',
							'aria-hidden': 'true'
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <p class="text-foreground text-xs leading-none font-medium">${$.escape(item.label)}</p></label>`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}