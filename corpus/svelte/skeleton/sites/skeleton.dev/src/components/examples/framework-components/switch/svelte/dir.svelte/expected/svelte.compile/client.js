import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Switch } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Dir($$anchor) {
	Switch($$anchor, {
		dir: 'rtl',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Switch.Control, ($$anchor, Switch_Control) => {
				Switch_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
							Switch_Thumb($$anchor, {});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node, 2);

			$.component(node_2, () => Switch.Label, ($$anchor, Switch_Label) => {
				Switch_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Label');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => Switch.HiddenInput, ($$anchor, Switch_HiddenInput) => {
				Switch_HiddenInput($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}