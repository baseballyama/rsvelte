import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TextInput from "carbon-components-svelte/TextInput/TextInput.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom Label Text</span>`);

export default function TextInputCustom_test($$anchor) {
	TextInput($$anchor, {
		labelText: 'Custom label',
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}