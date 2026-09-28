import * as $ from 'svelte/internal/server';

import {
	Button,
	ComposedModal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	ProgressIndicator,
	ProgressStep,
	Stack,
	TextInput
} from "carbon-components-svelte";

import { tick } from "svelte";

export default function ProgressModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		let step = 0;
		let name = "";
		let region = "";

		async function goNext() {
			if (step < 2) {
				step++;
				await tick();

				const nextInput = document.querySelector(step === 1
					? "#region-input"
					: ".bx--modal-container .bx--btn--primary");

				nextInput?.focus();
			} else {
				open = false;
			}
		}

		function handleSubmit() {
			goNext();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Create workspace`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ComposedModal($$renderer, {
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					ModalHeader($$renderer, { title: 'Create workspace' });
					$$renderer.push(`<!----> `);

					ModalBody($$renderer, {
						hasForm: true,
						children: ($$renderer) => {
							$$renderer.push(`<form id="workspace-form">`);

							Stack($$renderer, {
								gap: 6,
								children: ($$renderer) => {
									ProgressIndicator($$renderer, {
										currentIndex: step,
										spaceEqually: true,
										preventChangeOnClick: true,
										children: ($$renderer) => {
											ProgressStep($$renderer, { complete: step > 0, label: 'General' });
											$$renderer.push(`<!----> `);
											ProgressStep($$renderer, { complete: step > 1, label: 'Configure' });
											$$renderer.push(`<!----> `);
											ProgressStep($$renderer, { label: 'Review' });
											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									if (step === 0) {
										$$renderer.push('<!--[0-->');

										TextInput($$renderer, {
											id: 'name-input',
											labelText: 'Name',
											placeholder: 'e.g., My workspace',
											get value() {
												return name;
											},

											set value($$value) {
												name = $$value;
												$$settled = false;
											}
										});
									} else if (step === 1) {
										$$renderer.push('<!--[1-->');

										TextInput($$renderer, {
											id: 'region-input',
											labelText: 'Region',
											placeholder: 'e.g., us-east-1',
											get value() {
												return region;
											},

											set value($$value) {
												region = $$value;
												$$settled = false;
											}
										});
									} else {
										$$renderer.push(`<!--[-1--><p>Review your workspace configuration before creating.</p> `);

										if (name || region) {
											$$renderer.push(`<!--[0--><p><strong>Name:</strong> ${$.escape(name || "(not set)")}
              · <strong>Region:</strong> ${$.escape(region || "(not set)")}</p>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></form>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalFooter($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								kind: 'ghost',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								kind: 'secondary',
								disabled: step === 0,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Previous`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								type: 'submit',
								form: 'workspace-form',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(step < 2 ? "Next" : "Create")}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}