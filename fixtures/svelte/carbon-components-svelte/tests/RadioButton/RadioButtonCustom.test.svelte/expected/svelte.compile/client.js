import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RadioButton from "carbon-components-svelte/RadioButton/RadioButton.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom Label Text</span>`);

export default function RadioButtonCustom_test($$anchor) {
	RadioButton($$anchor, {
		labelText: 'Custom label',
		value: 'custom',
		name: 'test-group',
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}