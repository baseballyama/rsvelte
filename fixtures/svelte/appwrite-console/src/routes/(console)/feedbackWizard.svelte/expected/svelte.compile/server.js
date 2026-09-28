import * as $ from 'svelte/internal/server';
import { WizardWithSteps } from '$lib/layout';
import { onDestroy } from 'svelte';
import { feedbackData } from '$lib/stores/feedback';
import Step1 from './wizard/feedback/step1.svelte';
import Step2 from './wizard/feedback/step2.svelte';

export default function FeedbackWizard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onDestroy(() => {
			feedbackData.reset();
		});

		const stepsComponents = new Map();

		stepsComponents.set(1, { label: 'Feedback', component: Step1 });
		stepsComponents.set(2, { label: 'Thank you', component: Step2, optional: true });

		WizardWithSteps($$renderer, {
			title: 'Feedback',
			steps: stepsComponents,
			finalAction: 'Close'
		});
	});
}