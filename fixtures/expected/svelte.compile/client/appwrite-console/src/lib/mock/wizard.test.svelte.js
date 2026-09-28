import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Wizard from '$lib/layout/wizardWithSteps.svelte';
import Step1 from './wizard.step1.test.svelte';
import Step2 from './wizard.step2.test.svelte';
import { wizard } from '$lib/stores/wizard';

export default function Wizard_test($$anchor, $$props) {
	$.push($$props, true);

	const stepsComponents = new Map();

	stepsComponents.set(1, { label: 'label-step-1', component: Step1 });
	stepsComponents.set(2, { label: 'label-step-2', component: Step2 });

	function finish() {
		wizard.hide();
	}

	Wizard($$anchor, {
		title: 'wizard-title',
		get steps() {
			return stepsComponents;
		},
		$$events: { finish }
	});

	$.pop();
}