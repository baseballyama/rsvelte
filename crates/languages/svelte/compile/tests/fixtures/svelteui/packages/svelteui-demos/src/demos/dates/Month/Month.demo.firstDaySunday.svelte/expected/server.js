import * as $ from 'svelte/internal/server';
import { Group } from '@svelteuidev/core';
import { Month } from '@svelteuidev/dates';

const code = `
<script>
	import { Month } from '@svelteuidev/dates';
<\/script>

<Month month={new Date()} firstDayOfWeek="sunday" />
`;

export const type = 'demo';
export const configuration = { code };

export default function Month_demo_firstDaySunday($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Group($$renderer, {
			position: 'center',
			children: ($$renderer) => {
				Month($$renderer, { month: new Date(), firstDayOfWeek: 'sunday' });
			},
			$$slots: { default: true }
		});
	});
}