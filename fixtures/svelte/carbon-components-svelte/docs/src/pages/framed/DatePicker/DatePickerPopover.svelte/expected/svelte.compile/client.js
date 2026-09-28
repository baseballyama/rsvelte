import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, DatePicker, DatePickerInput } from "carbon-components-svelte";

var root = $.from_html(`<!> <div popover="manual" style="width: min(100%, 28rem); padding: 1rem; border: 1px dashed var(--cds-border-subtle);"><p>With <code>portalMenu</code>, the calendar auto-mounts into the nearest <code>[popover]</code> ancestor so it renders in the popover top layer instead of behind it.</p> <!> <!></div>`, 1);

export default function DatePickerPopover($$anchor) {
	let popover = null;
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		type: 'button',
		$$events: { click: () => popover?.showPopover() },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open popover');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.sibling($.child(div), 2);

	DatePicker(node_1, {
		portalMenu: true,
		datePickerType: 'single',
		children: ($$anchor, $$slotProps) => {
			DatePickerInput($$anchor, { labelText: 'Meeting date', placeholder: 'mm/dd/yyyy' });
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		kind: 'secondary',
		type: 'button',
		$$events: { click: () => popover?.hidePopover() },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Close');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.bind_this(div, ($$value) => popover = $$value, () => popover);
	$.append($$anchor, fragment);
}