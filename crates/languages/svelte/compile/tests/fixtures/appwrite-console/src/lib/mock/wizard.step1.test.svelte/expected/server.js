import * as $ from 'svelte/internal/server';
import InputText from '$lib/elements/forms/inputText.svelte';
import WizardStep from '$lib/layout/wizardStep.svelte';

export default function Wizard_step1_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = null;

		async function beforeSubmit() {
			if (value === 'fail') {
				throw new Error('failed');
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			WizardStep($$renderer, {
				beforeSubmit,
				children: ($$renderer) => {
					InputText($$renderer, {
						label: 'step-1-required',
						id: 'step-1-required',
						required: true,
						maxlength: 12,
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);
					InputText($$renderer, { label: 'step-1-optional', id: 'step-1-optional' });
					$$renderer.push(`<!---->`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`step-1`);
						}
					},

					subtitle: ($$renderer) => {
						{
							$$renderer.push(`sub-title-1`);
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}