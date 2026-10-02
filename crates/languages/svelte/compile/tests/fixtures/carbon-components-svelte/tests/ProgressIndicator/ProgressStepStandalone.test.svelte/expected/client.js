import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ProgressStep from "carbon-components-svelte/ProgressIndicator/ProgressStep.svelte";

export default function ProgressStepStandalone_test($$anchor) {
	ProgressStep($$anchor, { label: 'Standalone step', secondaryLabel: 'Optional' });
}