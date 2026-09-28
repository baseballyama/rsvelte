import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HeaderAction from "carbon-components-svelte/UIShell/HeaderAction.svelte";

var root = $.from_html(`<span slot="textChildren">Custom text content</span>`);
var root_1 = $.from_html(`<div slot="icon" data-testid="custom-icon">🔍</div>`);

export default function HeaderAction_slot_test($$anchor) {
	HeaderAction($$anchor, {
		text: 'Default text',
		$$slots: {
			textChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			},

			icon: ($$anchor, $$slotProps) => {
				var div = root_1();

				$.append($$anchor, div);
			}
		}
	});
}