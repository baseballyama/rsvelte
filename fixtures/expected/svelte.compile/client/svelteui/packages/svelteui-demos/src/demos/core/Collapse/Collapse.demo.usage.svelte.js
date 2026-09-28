import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Collapse, Stack } from '@svelteuidev/core';

const code = `
<script>
	import { Button, Collapse } from '@svelteuidev/core';

  let open = false;
<\/script>

<Button on:click={() => open = !open}>Open</Button>
<Collapse {open}>
  Avatar: The Last Airbender, also known as Avatar: The Legend of Aang in some PAL regions, is an Emmy award-winning American animated television series that aired for three seasons on Nickelodeon and the Nicktoons Network. The series was created and produced by Michael Dante DiMartino and Bryan Konietzko, who served as executive producers along with Aaron Ehasz. Avatar is set in an Asian-influenced world of martial arts and elemental manipulation. The show drew on elements from East Asian, South Asian, and Western culture, making it a mixture of what were previously traditionally separate categories of Japanese anime and Western domestic cartoons.
</Collapse>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Collapse_demo_usage($$anchor) {
	let open = false;

	Stack($$anchor, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Button(node, {
				$$events: { click: () => open = !open },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Open');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Collapse(node_1, {
				get open() {
					return open;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Avatar: The Last Airbender, also known as Avatar: The Legend of Aang in some PAL regions, is an\n		Emmy award-winning American animated television series that aired for three seasons on\n		Nickelodeon and the Nicktoons Network. The series was created and produced by Michael Dante\n		DiMartino and Bryan Konietzko, who served as executive producers along with Aaron Ehasz. Avatar\n		is set in an Asian-influenced world of martial arts and elemental manipulation. The show drew on\n		elements from East Asian, South Asian, and Western culture, making it a mixture of what were\n		previously traditionally separate categories of Japanese anime and Western domestic cartoons.');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}