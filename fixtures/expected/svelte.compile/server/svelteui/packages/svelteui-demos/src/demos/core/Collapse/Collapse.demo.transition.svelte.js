import * as $ from 'svelte/internal/server';
import { Button, Collapse, Stack } from '@svelteuidev/core';

const code = `
<script>
	import { Button, Collapse } from '@svelteuidev/core';

  let open = false;
<\/script>

<Button on:click={() => open = !open}>Open</Button>
<Collapse {open} transitionDuration={1000}>
  Avatar: The Last Airbender, also known as Avatar: The Legend of Aang in some PAL regions, is an Emmy award-winning American animated television series that aired for three seasons on Nickelodeon and the Nicktoons Network. The series was created and produced by Michael Dante DiMartino and Bryan Konietzko, who served as executive producers along with Aaron Ehasz. Avatar is set in an Asian-influenced world of martial arts and elemental manipulation. The show drew on elements from East Asian, South Asian, and Western culture, making it a mixture of what were previously traditionally separate categories of Japanese anime and Western domestic cartoons.
</Collapse>`;

export const type = 'demo';
export const configuration = { code };

export default function Collapse_demo_transition($$renderer) {
	let open = false;

	Stack($$renderer, {
		align: 'center',
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Collapse($$renderer, {
				open,
				transitionDuration: 1000,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Avatar: The Last Airbender, also known as Avatar: The Legend of Aang in some PAL regions, is an
		Emmy award-winning American animated television series that aired for three seasons on
		Nickelodeon and the Nicktoons Network. The series was created and produced by Michael Dante
		DiMartino and Bryan Konietzko, who served as executive producers along with Aaron Ehasz. Avatar
		is set in an Asian-influenced world of martial arts and elemental manipulation. The show drew on
		elements from East Asian, South Asian, and Western culture, making it a mixture of what were
		previously traditionally separate categories of Japanese anime and Western domestic cartoons.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}