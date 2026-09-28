import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NumberInput from "carbon-components-svelte/NumberInput/NumberInput.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom Label Text</span>`);

export default function NumberInputCustom_test($$anchor) {
	NumberInput($$anchor, {
		labelText: 'Custom label',
		value: 0,
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}