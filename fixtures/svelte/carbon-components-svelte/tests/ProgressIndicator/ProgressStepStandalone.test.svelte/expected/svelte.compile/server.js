import * as $ from 'svelte/internal/server';
import ProgressStep from "carbon-components-svelte/ProgressIndicator/ProgressStep.svelte";

export default function ProgressStepStandalone_test($$renderer) {
	ProgressStep($$renderer, { label: 'Standalone step', secondaryLabel: 'Optional' });
}