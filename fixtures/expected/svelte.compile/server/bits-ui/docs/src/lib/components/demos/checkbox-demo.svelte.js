import * as $ from 'svelte/internal/server';
import { Checkbox, Label } from "bits-ui";
import Check from "phosphor-svelte/lib/Check";
import Minus from "phosphor-svelte/lib/Minus";

export default function Checkbox_demo($$renderer) {
	$$renderer.push(`<div class="flex items-center space-x-3">`);

	{
		function children($$renderer, { checked, indeterminate }) {
			$$renderer.push(`<div class="text-background inline-flex items-center justify-center">`);

			if (indeterminate) {
				$$renderer.push('<!--[0-->');
				Minus($$renderer, { class: 'size-[15px]', weight: 'bold' });
			} else if (checked) {
				$$renderer.push('<!--[1-->');
				Check($$renderer, { class: 'size-[15px]', weight: 'bold' });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		if (Checkbox.Root) {
			$$renderer.push('<!--[-->');

			Checkbox.Root($$renderer, {
				id: 'terms',
				'aria-labelledby': 'terms-label',
				class: 'border-muted bg-foreground data-[state=unchecked]:border-border-input data-[state=unchecked]:bg-background data-[state=unchecked]:hover:border-dark-40 peer inline-flex size-[25px] items-center justify-center rounded-md border transition-all duration-150 ease-in-out active:scale-[0.98]',
				name: 'hello',
				indeterminate: true,
				children,
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	$$renderer.push(` `);

	if (Label.Root) {
		$$renderer.push('<!--[-->');

		Label.Root($$renderer, {
			id: 'terms-label',
			for: 'terms',
			class: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Accept terms and conditions`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}