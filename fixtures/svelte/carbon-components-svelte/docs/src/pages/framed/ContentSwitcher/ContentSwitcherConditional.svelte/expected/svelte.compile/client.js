import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, ContentSwitcher, Stack, Switch } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div><!> <!></div> <div><strong>Selected index:</strong> </div> <!>`, 1);

export default function ContentSwitcherConditional($$anchor) {
	let selectedIndex = 0;
	let showAdmin = true;
	let showSettings = true;

	Stack($$anchor, {
		gap: 3,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			Checkbox(node, {
				labelText: 'Show Admin switch',
				get checked() {
					return showAdmin;
				},

				set checked($$value) {
					showAdmin = $$value;
				}
			});

			var node_1 = $.sibling(node, 2);

			Checkbox(node_1, {
				labelText: 'Show Settings switch',
				get checked() {
					return showSettings;
				},

				set checked($$value) {
					showSettings = $$value;
				}
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var text = $.sibling($.child(div_1));

			$.reset(div_1);

			var node_2 = $.sibling(div_1, 2);

			ContentSwitcher(node_2, {
				get selectedIndex() {
					return selectedIndex;
				},

				set selectedIndex($$value) {
					selectedIndex = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					Switch(node_3, { text: 'Dashboard' });

					var node_4 = $.sibling(node_3, 2);

					{
						var consequent = ($$anchor) => {
							Switch($$anchor, { text: 'Admin' });
						};

						$.if(node_4, ($$render) => {
							if (showAdmin) $$render(consequent);
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						var consequent_1 = ($$anchor) => {
							Switch($$anchor, { text: 'Settings' });
						};

						$.if(node_5, ($$render) => {
							if (showSettings) $$render(consequent_1);
						});
					}

					var node_6 = $.sibling(node_5, 2);

					Switch(node_6, { text: 'Profile' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.template_effect(() => $.set_text(text, ` ${selectedIndex ?? ''}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}