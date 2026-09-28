import * as $ from 'svelte/internal/server';
import { Button, ProgressIndicator, ProgressStep, Stack } from "carbon-components-svelte";

export default function ProgrammaticProgressIndicator($$renderer) {
	let currentIndex = 1;
	let thirdStepCurrent = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				ProgressIndicator($$renderer, {
					get currentIndex() {
						return currentIndex;
					},

					set currentIndex($$value) {
						currentIndex = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						ProgressStep($$renderer, {
							complete: true,
							label: 'Step 1',
							description: 'The progress indicator will listen for clicks on the steps'
						});

						$$renderer.push(`<!----> `);

						ProgressStep($$renderer, {
							complete: true,
							label: 'Step 2',
							description: 'The progress indicator will listen for clicks on the steps'
						});

						$$renderer.push(`<!----> `);

						ProgressStep($$renderer, {
							complete: true,
							label: 'Step 3',
							description: 'The progress indicator will listen for clicks on the steps',
							get current() {
								return thirdStepCurrent;
							},

							set current($$value) {
								thirdStepCurrent = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						ProgressStep($$renderer, {
							label: 'Step 4',
							description: 'The progress indicator will listen for clicks on the steps'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Stack($$renderer, {
					gap: 4,
					children: ($$renderer) => {
						$$renderer.push(`<div>`);

						Button($$renderer, {
							kind: currentIndex === 2 ? "secondary" : "primary",
							size: 'small',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Set currentIndex to
        ${$.escape(currentIndex === 2 ? 0 : 2)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <div><strong>Current index:</strong> ${$.escape(currentIndex)}</div> <div><strong>Is the third step currently selected?</strong> ${$.escape(thirdStepCurrent)}</div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}