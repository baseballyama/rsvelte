import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { Unauthenticated } from '$lib/layout';
import { Button } from '$lib/elements/forms';
import { Badge, Typography, Layout } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function _error($$anchor) {
	Unauthenticated($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					gap: 'l',
					alignItems: 'center',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Badge(node_1, { variant: 'secondary', content: '404 Page not found' });

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Typography.Title, ($$anchor, Typography_Title) => {
							Typography_Title($$anchor, {
								size: 'l',
								align: 'center',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('The page you\'re looking for doesn\'t exist.');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						Button(node_3, {
							get href() {
								return base;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Back to console');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
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