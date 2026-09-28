import * as $ from 'svelte/internal/server';
import { Group } from '@svelteuidev/core';
import { Month } from '@svelteuidev/dates';

const code = `
<script>
    import { Month } from '@svelteuidev/dates';
<\/script>

<Month hideWeekdays month={new Date()} />
`;

export const type = 'demo';
export const configuration = { code };

export default function Month_demo_weekdays($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Group($$renderer, {
			position: 'center',
			children: ($$renderer) => {
				Month($$renderer, { month: new Date(), hideWeekdays: true });
			},
			$$slots: { default: true }
		});
	});
}