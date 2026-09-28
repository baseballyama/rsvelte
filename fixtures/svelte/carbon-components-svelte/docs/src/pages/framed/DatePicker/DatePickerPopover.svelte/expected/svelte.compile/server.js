import * as $ from 'svelte/internal/server';
import { Button, DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerPopover($$renderer) {
	let popover = null;

	Button($$renderer, {
		type: 'button',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Open popover`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div popover="manual" style="width: min(100%, 28rem); padding: 1rem; border: 1px dashed var(--cds-border-subtle);"><p>With <code>portalMenu</code>, the calendar auto-mounts into the nearest <code>[popover]</code> ancestor so it renders in the popover top layer instead of behind it.</p> `);

	DatePicker($$renderer, {
		portalMenu: true,
		datePickerType: 'single',
		children: ($$renderer) => {
			DatePickerInput($$renderer, { labelText: 'Meeting date', placeholder: 'mm/dd/yyyy' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		kind: 'secondary',
		type: 'button',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Close`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}