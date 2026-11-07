import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<p><strong>Name:</strong> <strong>Region:</strong> </p>`);
var root_2 = $.from_html(`<p>Review your workspace configuration before creating.</p> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<form id="workspace-form"><!></form>`);

export default function ProgressModal($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root_3();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: {
			click: () => {
				open = true;
				step = 0;
				name = "";
				region = "";
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Create workspace');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ComposedModal(node_1, {
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			ModalHeader(node_2, { title: 'Create workspace' });

			var node_3 = $.sibling(node_2, 2);

			ModalBody(node_3, {
				hasForm: true,
				children: ($$anchor, $$slotProps) => {
					var form = root_4();
					var node_4 = $.child(form);

					Stack(node_4, {
						gap: 6,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_3();
							var node_5 = $.first_child(fragment_2);

							ProgressIndicator(node_5, {
								get currentIndex() {
									return step;
								},
								spaceEqually: true,
								preventChangeOnClick: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_6 = $.first_child(fragment_3);

									{
										let $0 = $.derived(() => step > 0);

										ProgressStep(node_6, {
											get complete() {
												return $.get($0);
											},
											label: 'General'
										});
									}

									var node_7 = $.sibling(node_6, 2);

									{
										let $0 = $.derived(() => step > 1);

										ProgressStep(node_7, {
											get complete() {
												return $.get($0);
											},
											label: 'Configure'
										});
									}

									var node_8 = $.sibling(node_7, 2);

									ProgressStep(node_8, { label: 'Review' });
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_5, 2);

							{
								var consequent = ($$anchor) => {
									TextInput($$anchor, {
										id: 'name-input',
										labelText: 'Name',
										placeholder: 'e.g., My workspace',
										get value() {
											return name;
										},

										set value($$value) {
											name = $$value;
										}
									});
								};

								var consequent_1 = ($$anchor) => {
									TextInput($$anchor, {
										id: 'region-input',
										labelText: 'Region',
										placeholder: 'e.g., us-east-1',
										get value() {
											return region;
										},

										set value($$value) {
											region = $$value;
										}
									});
								};

								var alternate = ($$anchor) => {
									var fragment_6 = root_2();
									var node_10 = $.sibling($.first_child(fragment_6), 2);

									{
										var consequent_2 = ($$anchor) => {
											var p = root_1();
											var text_1 = $.sibling($.child(p));
											var text_2 = $.sibling(text_1, 2);

											$.reset(p);

											$.template_effect(() => {
												$.set_text(text_1, ` ${(name || "(not set)") ?? ''}
              · `);

												$.set_text(text_2, ` ${(region || "(not set)") ?? ''}`);
											});

											$.append($$anchor, p);
										};

										$.if(node_10, ($$render) => {
											if (name || region) $$render(consequent_2);
										});
									}

									$.append($$anchor, fragment_6);
								};

								$.if(node_9, ($$render) => {
									if (step === 0) $$render(consequent); else if (step === 1) $$render(consequent_1, 1); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});

					$.reset(form);
					$.event('submit', form, $.preventDefault(handleSubmit));
					$.append($$anchor, form);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_3, 2);

			ModalFooter(node_11, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root();
					var node_12 = $.first_child(fragment_7);

					Button(node_12, {
						kind: 'ghost',
						$$events: { click: () => open = false },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Cancel');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					{
						let $0 = $.derived(() => step === 0);

						Button(node_13, {
							kind: 'secondary',
							get disabled() {
								return $.get($0);
							},
							$$events: { click: () => step-- },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Previous');

								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});
					}

					var node_14 = $.sibling(node_13, 2);

					Button(node_14, {
						type: 'submit',
						form: 'workspace-form',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text();

							$.template_effect(() => $.set_text(text_5, step < 2 ? "Next" : "Create"));
							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}