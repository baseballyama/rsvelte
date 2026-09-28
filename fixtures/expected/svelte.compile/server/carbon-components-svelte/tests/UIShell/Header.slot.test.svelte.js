import * as $ from 'svelte/internal/server';
import Header from "carbon-components-svelte/UIShell/Header.svelte";

export default function Header_slot_test($$renderer) {
	Header($$renderer, {
		companyName: 'Default company',
		$$slots: {
			company: ($$renderer) => {
				$$renderer.push(`<span slot="company">Custom company content</span>`);
			}
		}
	});
}