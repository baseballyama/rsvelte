import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Stack } from "carbon-components-svelte";
import ArrowRight from "carbon-icons-svelte/lib/ArrowRight.svelte";
import LogoGithub from "carbon-icons-svelte/lib/LogoGithub.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function HomePageActions($$anchor) {
	Stack($$anchor, {
		orientation: 'horizontal',
		gap: 4,
		align: 'center',
		wrap: 'wrap',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Button(node, {
				get icon() {
					return ArrowRight;
				},
				href: '/quick-start',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Get started');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				kind: 'tertiary',
				get icon() {
					return LogoGithub;
				},
				href: 'https://github.com/carbon-design-system/carbon-components-svelte',
				target: '_blank',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('View on GitHub');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}