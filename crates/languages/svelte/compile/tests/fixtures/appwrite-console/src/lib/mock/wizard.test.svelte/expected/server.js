import * as $ from 'svelte/internal/server';
import Wizard from '$lib/layout/wizardWithSteps.svelte';
import Step1 from './wizard.step1.test.svelte';
import Step2 from './wizard.step2.test.svelte';
import { wizard } from '$lib/stores/wizard';

export default function Wizard_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const stepsComponents = new Map();

		stepsComponents.set(1, { label: 'label-step-1', component: Step1 });
		stepsComponents.set(2, { label: 'label-step-2', component: Step2 });

		function finish() {
			wizard.hide();
		}

		Wizard($$renderer, { title: 'wizard-title', steps: stepsComponents });
	});
}