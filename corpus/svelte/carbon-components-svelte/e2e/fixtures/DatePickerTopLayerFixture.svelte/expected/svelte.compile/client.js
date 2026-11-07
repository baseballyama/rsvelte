import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, DatePicker, DatePickerInput } from "carbon-components-svelte";

var root = $.from_html(`<button type="button" data-testid="open-dialog">Open dialog</button> <dialog data-testid="native-dialog"><!> <!></dialog> <button type="button" data-testid="open-popover">Open popover</button> <div data-testid="native-popover" popover="manual" style="width: 600px; padding: 1rem;"><button type="button">Close</button> <!></div>`, 1);

export default function DatePickerTopLayerFixture($$anchor) {
	let dialog = null;
	let popover = null;
	var fragment = root();
	var button = $.first_child(fragment);
	var dialog_1 = $.sibling(button, 2);
	var node = $.child(dialog_1);

	Button(node, {
		kind: 'secondary',
		$$events: { click: () => dialog?.close() },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Close');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	DatePicker(node_1, {
		portalMenu: true,
		datePickerType: 'single',
		children: ($$anchor, $$slotProps) => {
			DatePickerInput($$anchor, {
				'data-testid': 'dialog-date-picker-portal-input',
				labelText: 'Dialog date (portalMenu)',
				placeholder: 'mm/dd/yyyy'
			});
		},
		$$slots: { default: true }
	});

	$.reset(dialog_1);
	$.bind_this(dialog_1, ($$value) => dialog = $$value, () => dialog);

	var button_1 = $.sibling(dialog_1, 2);
	var div = $.sibling(button_1, 2);
	var button_2 = $.child(div);
	var node_2 = $.sibling(button_2, 2);

	DatePicker(node_2, {
		portalMenu: true,
		datePickerType: 'single',
		children: ($$anchor, $$slotProps) => {
			DatePickerInput($$anchor, {
				'data-testid': 'popover-date-picker-portal-input',
				labelText: 'Popover date (portalMenu)',
				placeholder: 'mm/dd/yyyy'
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.bind_this(div, ($$value) => popover = $$value, () => popover);
	$.event('click', button, () => dialog?.showModal());
	$.event('click', button_1, () => popover?.showPopover());
	$.event('click', button_2, () => popover?.hidePopover());
	$.append($$anchor, fragment);
}