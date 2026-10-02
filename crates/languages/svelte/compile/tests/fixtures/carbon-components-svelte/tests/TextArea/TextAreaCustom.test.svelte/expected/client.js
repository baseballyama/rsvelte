import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TextArea from "carbon-components-svelte/TextArea/TextArea.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom Label Text</span>`);

export default function TextAreaCustom_test($$anchor) {
	TextArea($$anchor, {
		labelText: 'Custom label',
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}