import * as $ from 'svelte/internal/server';
import ProgressIndicator from "carbon-components-svelte/ProgressIndicator/ProgressIndicator.svelte";
import ProgressStep from "carbon-components-svelte/ProgressIndicator/ProgressStep.svelte";

export default function ProgressStepIconSlot_test($$renderer) {
	ProgressIndicator($$renderer, {
		currentIndex: 1,
		children: ($$renderer) => {
			ProgressStep($$renderer, {
				complete: true,
				label: 'Step 1',
				description: 'Completed',
				$$slots: {
					icon: ($$renderer, { complete, current, invalid }) => {
						$$renderer.push(`<span slot="icon" data-testid="icon-1">c:${$.escape(complete)}|cur:${$.escape(current)}|inv:${$.escape(invalid)}</span>`);
					}
				}
			});

			$$renderer.push(`<!----> `);

			ProgressStep($$renderer, {
				label: 'Step 2',
				description: 'Current',
				$$slots: {
					icon: ($$renderer, { complete, current, invalid }) => {
						$$renderer.push(`<span slot="icon" data-testid="icon-2">c:${$.escape(complete)}|cur:${$.escape(current)}|inv:${$.escape(invalid)}</span>`);
					}
				}
			});

			$$renderer.push(`<!----> `);

			ProgressStep($$renderer, {
				invalid: true,
				label: 'Step 3',
				description: 'Invalid',
				$$slots: {
					icon: ($$renderer, { complete, current, invalid }) => {
						$$renderer.push(`<span slot="icon" data-testid="icon-3">c:${$.escape(complete)}|cur:${$.escape(current)}|inv:${$.escape(invalid)}</span>`);
					}
				}
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}