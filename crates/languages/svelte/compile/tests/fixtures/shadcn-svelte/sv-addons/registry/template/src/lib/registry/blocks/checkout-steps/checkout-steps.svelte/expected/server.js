import * as $ from 'svelte/internal/server';
import * as Stepper from "$lib/registry/ui/stepper/index.js";

export default function Checkout_steps($$renderer) {
	if (Stepper.Root) {
		$$renderer.push('<!--[-->');

		Stepper.Root($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like({ length: 5 });

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let _ = each_array[i];

					if (Stepper.Item) {
						$$renderer.push('<!--[-->');
						Stepper.Item($$renderer, { step: i + 1 });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}