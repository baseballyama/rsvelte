import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ProgressIndicator, ProgressStep, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div><!></div> <div><strong>Current index:</strong> </div> <div><strong>Is the third step currently selected?</strong> </div>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function ProgrammaticProgressIndicator($$anchor) {
	let currentIndex = 1;
	let thirdStepCurrent = false;

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			ProgressIndicator(node, {
				get currentIndex() {
					return currentIndex;
				},

				set currentIndex($$value) {
					currentIndex = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					ProgressStep(node_1, {
						complete: true,
						label: 'Step 1',
						description: 'The progress indicator will listen for clicks on the steps'
					});

					var node_2 = $.sibling(node_1, 2);

					ProgressStep(node_2, {
						complete: true,
						label: 'Step 2',
						description: 'The progress indicator will listen for clicks on the steps'
					});

					var node_3 = $.sibling(node_2, 2);

					ProgressStep(node_3, {
						complete: true,
						label: 'Step 3',
						description: 'The progress indicator will listen for clicks on the steps',
						get current() {
							return thirdStepCurrent;
						},

						set current($$value) {
							thirdStepCurrent = $$value;
						}
					});

					var node_4 = $.sibling(node_3, 2);

					ProgressStep(node_4, {
						label: 'Step 4',
						description: 'The progress indicator will listen for clicks on the steps'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node, 2);

			Stack(node_5, {
				gap: 4,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var div = $.first_child(fragment_3);
					var node_6 = $.child(div);

					{
						let $0 = $.derived(() => currentIndex === 2 ? "secondary" : "primary");

						Button(node_6, {
							get kind() {
								return $.get($0);
							},
							size: 'small',
							$$events: {
								click: () => {
									currentIndex = currentIndex === 2 ? 0 : 2;
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, `Set currentIndex to
        ${currentIndex === 2 ? 0 : 2}`));

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					}

					$.reset(div);

					var div_1 = $.sibling(div, 2);
					var text_1 = $.sibling($.child(div_1));

					$.reset(div_1);

					var div_2 = $.sibling(div_1, 2);
					var text_2 = $.sibling($.child(div_2));

					$.reset(div_2);

					$.template_effect(() => {
						$.set_text(text_1, ` ${currentIndex ?? ''}`);
						$.set_text(text_2, ` ${thirdStepCurrent ?? ''}`);
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}