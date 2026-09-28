import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PasswordInput from "carbon-components-svelte/TextInput/PasswordInput.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom label content</span>`);

export default function PasswordInput_slot_test($$anchor) {
	PasswordInput($$anchor, {
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}