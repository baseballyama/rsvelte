import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InputText } from '$lib/elements/forms';
import WizardStep from '$lib/layout/wizardStep.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Wizard_step2_test($$anchor) {
	WizardStep($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			InputText(node, { label: 'step-2-first', id: 'step-2-first' });

			var node_1 = $.sibling(node, 2);

			InputText(node_1, { label: 'step-2-second', id: 'step-2-second' });
			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text = $.text('step-2');

				$.append($$anchor, text);
			},

			subtitle: ($$anchor, $$slotProps) => {
				var text_1 = $.text('sub-title-2');

				$.append($$anchor, text_1);
			}
		}
	});
}