import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AppBar } from '../../src/index.js';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function App_bar($$anchor) {
	AppBar($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => AppBar.Toolbar, ($$anchor, AppBar_Toolbar) => {
				AppBar_Toolbar($$anchor, {
					'data-testid': 'toolbar',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => AppBar.Lead, ($$anchor, AppBar_Lead) => {
							AppBar_Lead($$anchor, { 'data-testid': 'lead' });
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => AppBar.Headline, ($$anchor, AppBar_Headline) => {
							AppBar_Headline($$anchor, { 'data-testid': 'headline' });
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => AppBar.Trail, ($$anchor, AppBar_Trail) => {
							AppBar_Trail($$anchor, { 'data-testid': 'trail' });
						});

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