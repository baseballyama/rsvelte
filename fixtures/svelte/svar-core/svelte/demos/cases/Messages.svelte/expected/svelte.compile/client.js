import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Modal, Text, TextArea, Portal, Button } from "../../src/index";
import { getContext } from "svelte";

var root = $.from_html(`<div style="margin-top: 20px;"><!> <!> <!></div>`);
var root_1 = $.from_html(`Some text here <!>`, 1);
var root_2 = $.from_html(`<div class="demo-box"><h3>Notice</h3> <div class="demo-row"><!> <!> <!> <!> <!> <!></div></div> <div class="demo-box"><h3>Confirm / Alert</h3> <!> <!></div> <div class="demo-box"><h3>Custom dialog</h3> <!> <!> <!> <!></div>`, 1);

export default function Messages($$anchor, $$props) {
	$.push($$props, true);

	const { showNotice, showModal } = getContext("wx-helpers");

	function notice(type, text) {
		showNotice({ type, expire: -1, text: text || "Button clicked" });
	}

	async function confirm() {
		try {
			await showModal({ title: "Confirm", message: "Will we do it ?" });
		} catch(er) {
			console.log("confirm was rejected", er);
		}
	}

	function alert() {
		showModal({ message: "Something happens", buttons: ["ok"] });
	}

	let custom1 = $.state(void 0);
	let custom2 = $.state(void 0);

	function hideAll() {
		$.set(custom1, $.set(custom2, false), true);
	}

	var fragment = root_2();
	var div = $.first_child(fragment);
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Button(node, {
		type: 'primary',
		onclick: () => notice(""),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Show Notice');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: () => notice("info"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Show Info');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: () => notice("warning"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Show Warning');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		onclick: () => notice("success"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Show Success');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		onclick: () => notice("danger"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Show Danger');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		onclick: () => notice("info", "very long text goes here to show word wrap"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Show Long message');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var node_6 = $.sibling($.child(div_2), 2);

	Button(node_6, {
		type: 'primary',
		onclick: confirm,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Show Confirm');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Button(node_7, {
		onclick: alert,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Show Alert');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_8 = $.sibling($.child(div_3), 2);

	Button(node_8, {
		type: 'primary',
		onclick: () => $.set(custom1, !$.get(custom1)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Show Prompt');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	{
		var consequent = ($$anchor) => {
			Portal($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Modal($$anchor, {
						title: 'Custom Prompt',
						onconfirm: hideAll,
						oncancel: hideAll,
						children: ($$anchor, $$slotProps) => {
							Text($$anchor, { select: true, focus: true, value: 'Some' });
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		$.if(node_9, ($$render) => {
			if ($.get(custom1)) $$render(consequent);
		});
	}

	var node_10 = $.sibling(node_9, 2);

	Button(node_10, {
		onclick: () => $.set(custom2, !$.get(custom2)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Show Dialog');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	{
		var consequent_1 = ($$anchor) => {
			{
				const footer = ($$anchor) => {
					var div_4 = root();
					var node_12 = $.child(div_4);

					Button(node_12, {
						onclick: hideAll,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('Yes');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					Button(node_13, {
						onclick: hideAll,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('No');

							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_13, 2);

					Button(node_14, {
						onclick: hideAll,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('Maybe');

							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				Modal($$anchor, {
					footer,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_5 = root_1();
						var node_15 = $.sibling($.first_child(fragment_5));

						TextArea(node_15, { placeholder: 'Some text' });
						$.append($$anchor, fragment_5);
					},
					$$slots: { footer: true, default: true }
				});
			}
		};

		$.if(node_11, ($$render) => {
			if ($.get(custom2)) $$render(consequent_1);
		});
	}

	$.reset(div_3);
	$.append($$anchor, fragment);
	$.pop();
}