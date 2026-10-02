import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	{
		function badge($$renderer) {
			ButtonBadge($$renderer, { slot: 'badge' });
			$$renderer.push(`<!----> `);

			Component($$renderer, {
				$$slots: {
					named: ($$renderer, { value }) => {
						Slotted($$renderer, { slot: 'named' });
					}
				}
			});

			$$renderer.push(`<!---->`);
		}

		Parent($$renderer, { badge, $$slots: { badge: true } });
	}
}