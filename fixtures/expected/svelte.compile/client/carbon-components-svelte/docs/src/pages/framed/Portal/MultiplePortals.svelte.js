import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, Portal } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function MultiplePortals($$anchor) {
	let showPortal1 = false;
	let showPortal2 = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	ButtonSet(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				$$events: { click: () => showPortal1 = !showPortal1 },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, showPortal1 ? "Unmount portal 1" : "Mount portal 1"));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				$$events: { click: () => showPortal2 = !showPortal2 },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, showPortal2 ? "Unmount portal 2" : "Mount portal 2"));
					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Portal($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Portal content 1');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_3, ($$render) => {
			if (showPortal1) $$render(consequent);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_1 = ($$anchor) => {
			Portal($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Portal content 2');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_4, ($$render) => {
			if (showPortal2) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
}