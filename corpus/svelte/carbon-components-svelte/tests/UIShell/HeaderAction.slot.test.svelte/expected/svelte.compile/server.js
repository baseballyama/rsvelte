import * as $ from 'svelte/internal/server';
import HeaderAction from "carbon-components-svelte/UIShell/HeaderAction.svelte";

export default function HeaderAction_slot_test($$renderer) {
	HeaderAction($$renderer, {
		text: 'Default text',
		$$slots: {
			textChildren: ($$renderer) => {
				$$renderer.push(`<span slot="textChildren">Custom text content</span>`);
			},

			icon: ($$renderer) => {
				$$renderer.push(`<div slot="icon" data-testid="custom-icon">🔍</div>`);
			}
		}
	});
}