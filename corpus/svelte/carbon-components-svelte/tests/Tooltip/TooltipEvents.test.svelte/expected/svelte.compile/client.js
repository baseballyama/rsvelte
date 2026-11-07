import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

var root = $.from_html(`<div><p> </p> <p> </p> <!></div>`);

export default function TooltipEvents_test($$anchor) {
	let openCount = 0;
	let closeCount = 0;

	function handleOpen() {
		openCount += 1;
	}

	function handleClose() {
		closeCount += 1;
	}

	var div = root();
	var p = $.child(div);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var node = $.sibling(p_1, 2);

	Tooltip(node, {
		iconDescription: 'Information',
		$$events: { open: handleOpen, close: handleClose },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Interact with this tooltip to trigger events');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, `Open events: ${openCount ?? ''}`);
		$.set_text(text_1, `Close events: ${closeCount ?? ''}`);
	});

	$.append($$anchor, div);
}