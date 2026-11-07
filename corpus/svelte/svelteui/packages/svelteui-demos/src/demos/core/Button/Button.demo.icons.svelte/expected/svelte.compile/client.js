import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Group } from '@svelteuidev/core';
import { GithubLogo } from 'radix-icons-svelte';

const code = `
<script>
	import { Button } from '@svelteuidev/core';
	import { GithubLogo } from 'radix-icons-svelte';
<\/script>

<Button>
	<GithubLogo slot="leftIcon" />
	Icon on left
</Button>
<Button>
	Icon on right
	<GithubLogo slot="rightIcon" />
</Button>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Button_demo_icons($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Button(node, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Icon on left');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					leftIcon: ($$anchor, $$slotProps) => {
						GithubLogo($$anchor, { slot: 'leftIcon' });
					}
				}
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Icon on right');

					$.append($$anchor, text_1);
				},

				$$slots: {
					default: true,
					rightIcon: ($$anchor, $$slotProps) => {
						GithubLogo($$anchor, { slot: 'rightIcon' });
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}