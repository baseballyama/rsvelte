import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { StepIndicator } from "flowbite-svelte";

export default function HideLabel($$anchor) {
	let currentStep = 2;
	let steps = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"];

	StepIndicator($$anchor, {
		currentStep,
		get steps() {
			return steps;
		},
		hideLabel: true
	});
}