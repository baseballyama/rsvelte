import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ProgressIndicator from "carbon-components-svelte/ProgressIndicator/ProgressIndicator.svelte";
import ProgressStep from "carbon-components-svelte/ProgressIndicator/ProgressStep.svelte";

var root = $.from_html(`<span slot="icon" data-testid="icon-1"> </span>`);
var root_1 = $.from_html(`<span slot="icon" data-testid="icon-2"> </span>`);
var root_2 = $.from_html(`<span slot="icon" data-testid="icon-3"> </span>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function ProgressStepIconSlot_test($$anchor) {
	ProgressIndicator($$anchor, {
		currentIndex: 1,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			ProgressStep(node, {
				complete: true,
				label: 'Step 1',
				description: 'Completed',
				$$slots: {
					icon: ($$anchor, $$slotProps) => {
						const complete = $.derived(() => $$slotProps.complete);
						const current = $.derived(() => $$slotProps.current);
						const invalid = $.derived(() => $$slotProps.invalid);
						var span = root();
						var text = $.only_child(span);

						$.template_effect(() => $.set_text(text, `c:${$.get(complete) ?? ''}|cur:${$.get(current) ?? ''}|inv:${$.get(invalid) ?? ''}`));
						$.append($$anchor, span);
					}
				}
			});

			var node_1 = $.sibling(node, 2);

			ProgressStep(node_1, {
				label: 'Step 2',
				description: 'Current',
				$$slots: {
					icon: ($$anchor, $$slotProps) => {
						const complete = $.derived(() => $$slotProps.complete);
						const current = $.derived(() => $$slotProps.current);
						const invalid = $.derived(() => $$slotProps.invalid);
						var span_1 = root_1();
						var text_1 = $.only_child(span_1);

						$.template_effect(() => $.set_text(text_1, `c:${$.get(complete) ?? ''}|cur:${$.get(current) ?? ''}|inv:${$.get(invalid) ?? ''}`));
						$.append($$anchor, span_1);
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);

			ProgressStep(node_2, {
				invalid: true,
				label: 'Step 3',
				description: 'Invalid',
				$$slots: {
					icon: ($$anchor, $$slotProps) => {
						const complete = $.derived(() => $$slotProps.complete);
						const current = $.derived(() => $$slotProps.current);
						const invalid = $.derived(() => $$slotProps.invalid);
						var span_2 = root_2();
						var text_2 = $.only_child(span_2);

						$.template_effect(() => $.set_text(text_2, `c:${$.get(complete) ?? ''}|cur:${$.get(current) ?? ''}|inv:${$.get(invalid) ?? ''}`));
						$.append($$anchor, span_2);
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}