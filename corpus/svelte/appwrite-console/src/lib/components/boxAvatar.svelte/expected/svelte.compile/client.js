import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Box } from '.';
import { Layout } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <div><!> <!></div>`, 1);

export default function BoxAvatar($$anchor, $$props) {
	Box($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					direction: 'row',
					justifyContent: 'flex-start',
					alignItems: 'center',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.slot(node_1, $$props, 'image', {}, null);

						var div = $.sibling(node_1, 2);
						var node_2 = $.child(div);

						$.slot(node_2, $$props, 'title', {}, null);

						var node_3 = $.sibling(node_2, 2);

						$.slot(node_3, $$props, 'default', {}, null);
						$.reset(div);
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}