import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Collapsible } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Dir($$anchor) {
	Collapsible($$anchor, {
		dir: 'rtl',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
				Collapsible_Content($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('The world dies over and over again, but the skeleton always gets up and walks. Every heart has its own skeletons. The bones of the\n		skeleton which support the body can become the bars of the cage which imprison the spirit.');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
				Collapsible_Trigger($$anchor, {
					class: 'btn preset-filled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Toggle');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}