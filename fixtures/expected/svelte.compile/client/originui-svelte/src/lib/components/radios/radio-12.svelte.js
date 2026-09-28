import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';
import IconApple from '~icons/ri/apple-line';
import IconBankCard from '~icons/ri/bank-card-line';
import IconPaypal from '~icons/ri/paypal-line';

var root = $.from_html(`<label class="border-input ring-offset-background has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent has-focus-visible:ring-ring/70 relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border px-2 py-3 text-center shadow-xs shadow-black/[.04] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-offset-2"><!> <!> <p class="text-foreground text-xs leading-none font-medium"> </p></label>`);

export default function Radio_12($$anchor) {
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

	let selectedValue = $.state('cc');

	RadioGroup($$anchor, {
		class: 'grid grid-cols-3 gap-2',
		get value() {
			return $.get(selectedValue);
		},

		set value($$value) {
			$.set(selectedValue, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => items, (item) => item.id, ($$anchor, item) => {
				var label = root();
				var node_1 = $.child(label);

				RadioGroupItem(node_1, {
					get id() {
						return $.get(item).id;
					},

					get value() {
						return $.get(item).value;
					},
					class: 'sr-only after:absolute after:inset-0'
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => $.get(item).Icon, ($$anchor, item_Icon) => {
					item_Icon($$anchor, {
						class: 'opacity-60',
						width: '20',
						height: '20',
						'aria-hidden': 'true'
					});
				});

				var p = $.sibling(node_2, 2);
				var text = $.only_child(p, true);

				$.reset(label);
				$.template_effect(() => $.set_text(text, $.get(item).label));
				$.append($$anchor, label);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}