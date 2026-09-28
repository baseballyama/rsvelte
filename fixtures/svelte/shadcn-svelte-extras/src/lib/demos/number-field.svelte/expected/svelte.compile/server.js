import * as $ from 'svelte/internal/server';
import * as NumberField from '$lib/components/ui/number-field';

export default function Number_field($$renderer) {
	if (NumberField.Root) {
		$$renderer.push('<!--[-->');

		NumberField.Root($$renderer, {
			min: -1000,
			max: 1000,
			children: ($$renderer) => {
				if (NumberField.Group) {
					$$renderer.push('<!--[-->');

					NumberField.Group($$renderer, {
						children: ($$renderer) => {
							if (NumberField.Decrement) {
								$$renderer.push('<!--[-->');
								NumberField.Decrement($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (NumberField.Input) {
								$$renderer.push('<!--[-->');
								NumberField.Input($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (NumberField.Increment) {
								$$renderer.push('<!--[-->');
								NumberField.Increment($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
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