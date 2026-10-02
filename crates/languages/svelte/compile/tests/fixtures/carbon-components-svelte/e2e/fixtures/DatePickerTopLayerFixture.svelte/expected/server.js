import * as $ from 'svelte/internal/server';
import { Button, DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerTopLayerFixture($$renderer) {
	let dialog = null;
	let popover = null;

	$$renderer.push(`<button type="button" data-testid="open-dialog">Open dialog</button> <dialog data-testid="native-dialog">`);

	Button($$renderer, {
		kind: 'secondary',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Close`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	DatePicker($$renderer, {
		portalMenu: true,
		datePickerType: 'single',
		children: ($$renderer) => {
			DatePickerInput($$renderer, {
				'data-testid': 'dialog-date-picker-portal-input',
				labelText: 'Dialog date (portalMenu)',
				placeholder: 'mm/dd/yyyy'
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></dialog> <button type="button" data-testid="open-popover">Open popover</button> <div data-testid="native-popover" popover="manual" style="width: 600px; padding: 1rem;"><button type="button">Close</button> `);

	DatePicker($$renderer, {
		portalMenu: true,
		datePickerType: 'single',
		children: ($$renderer) => {
			DatePickerInput($$renderer, {
				'data-testid': 'popover-date-picker-portal-input',
				labelText: 'Popover date (portalMenu)',
				placeholder: 'mm/dd/yyyy'
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}