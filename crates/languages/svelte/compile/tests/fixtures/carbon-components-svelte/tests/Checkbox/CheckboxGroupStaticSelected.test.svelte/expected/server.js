import * as $ from 'svelte/internal/server';
import Checkbox from "carbon-components-svelte/Checkbox/Checkbox.svelte";
import CheckboxGroup from "carbon-components-svelte/Checkbox/CheckboxGroup.svelte";

export default function CheckboxGroupStaticSelected_test($$renderer) {
	CheckboxGroup($$renderer, {
		legendText: 'Notification preferences',
		name: 'prefs',
		selected: ["email"],
		children: ($$renderer) => {
			Checkbox($$renderer, { value: 'email', labelText: 'Email' });
			$$renderer.push(`<!----> `);
			Checkbox($$renderer, { value: 'sms', labelText: 'SMS' });
			$$renderer.push(`<!----> `);
			Checkbox($$renderer, { value: 'push', labelText: 'Push notifications' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}