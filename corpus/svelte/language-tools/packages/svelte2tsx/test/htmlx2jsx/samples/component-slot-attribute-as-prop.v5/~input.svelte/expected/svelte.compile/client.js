import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	{
		const badge = ($$anchor) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ButtonBadge(node, { slot: 'badge' });

			var node_1 = $.sibling(node, 2);

			Component(node_1, {
				$$slots: {
					named: ($$anchor, $$slotProps) => {
						const value = $.derived(() => $$slotProps.value);

						Slotted($$anchor, { slot: 'named' });
					}
				}
			});

			$.append($$anchor, fragment_1);
		};

		Parent($$anchor, { badge, $$slots: { badge: true } });
	}
}