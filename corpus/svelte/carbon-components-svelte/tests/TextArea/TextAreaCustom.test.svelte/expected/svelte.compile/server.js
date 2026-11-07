import * as $ from 'svelte/internal/server';
import TextArea from "carbon-components-svelte/TextArea/TextArea.svelte";

export default function TextAreaCustom_test($$renderer) {
	TextArea($$renderer, {
		labelText: 'Custom label',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom Label Text</span>`);
			}
		}
	});
}