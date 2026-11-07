import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TextInput from "carbon-components-svelte/TextInput/TextInput.svelte";

var root = $.from_html(`<span slot="labelChildren">Inline Slot Label</span>`);

export default function TextInputInlineLabelChildren_test($$anchor) {
	TextInput($$anchor, {
		inline: true,
		labelText: '',
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}