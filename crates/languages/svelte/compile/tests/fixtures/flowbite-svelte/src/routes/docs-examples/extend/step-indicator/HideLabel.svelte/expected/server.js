import * as $ from 'svelte/internal/server';
import { StepIndicator } from "flowbite-svelte";

export default function HideLabel($$renderer) {
	let currentStep = 2;
	let steps = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"];

	StepIndicator($$renderer, { currentStep, steps, hideLabel: true });
}