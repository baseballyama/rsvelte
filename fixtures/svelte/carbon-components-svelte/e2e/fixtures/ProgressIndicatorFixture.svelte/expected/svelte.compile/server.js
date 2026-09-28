import * as $ from 'svelte/internal/server';
import { ProgressIndicator, ProgressStep } from "carbon-components-svelte";

export default function ProgressIndicatorFixture($$renderer) {
	let currentIndex = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div data-testid="current-index"${$.attr('data-current', currentIndex)}>`);

		ProgressIndicator($$renderer, {
			'data-testid': 'progress-indicator',
			get currentIndex() {
				return currentIndex;
			},

			set currentIndex($$value) {
				currentIndex = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ProgressStep($$renderer, { label: 'First step', description: 'Step 1', complete: true });
				$$renderer.push(`<!----> `);
				ProgressStep($$renderer, { label: 'Second step', description: 'Step 2', complete: true });
				$$renderer.push(`<!----> `);
				ProgressStep($$renderer, { label: 'Third step', description: 'Step 3', complete: true });
				$$renderer.push(`<!----> `);
				ProgressStep($$renderer, { label: 'Fourth step', description: 'Step 4', complete: true });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}