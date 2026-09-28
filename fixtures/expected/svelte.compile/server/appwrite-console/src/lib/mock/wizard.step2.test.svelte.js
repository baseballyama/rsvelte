import * as $ from 'svelte/internal/server';
import { InputText } from '$lib/elements/forms';
import WizardStep from '$lib/layout/wizardStep.svelte';

export default function Wizard_step2_test($$renderer) {
	WizardStep($$renderer, {
		children: ($$renderer) => {
			InputText($$renderer, { label: 'step-2-first', id: 'step-2-first' });
			$$renderer.push(`<!----> `);
			InputText($$renderer, { label: 'step-2-second', id: 'step-2-second' });
			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			title: ($$renderer) => {
				{
					$$renderer.push(`step-2`);
				}
			},

			subtitle: ($$renderer) => {
				{
					$$renderer.push(`sub-title-2`);
				}
			}
		}
	});
}