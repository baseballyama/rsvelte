import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import InputText from '$lib/elements/forms/inputText.svelte';
import WizardStep from '$lib/layout/wizardStep.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Wizard_step1_test($$anchor, $$props) {
	$.push($$props, true);

	let value = null;

	async function beforeSubmit() {
		if (value === 'fail') {
			throw new Error('failed');
		}
	}

	WizardStep($$anchor, {
		beforeSubmit,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			InputText(node, {
				label: 'step-1-required',
				id: 'step-1-required',
				required: true,
				maxlength: 12,
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});

			var node_1 = $.sibling(node, 2);

			InputText(node_1, { label: 'step-1-optional', id: 'step-1-optional' });
			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text = $.text('step-1');

				$.append($$anchor, text);
			},

			subtitle: ($$anchor, $$slotProps) => {
				var text_1 = $.text('sub-title-1');

				$.append($$anchor, text_1);
			}
		}
	});

	$.pop();
}