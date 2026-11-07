import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Month_demo_weekdays($$anchor, $$props) {
	$.push($$props, true);

	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			Month($$anchor, { month: new Date(), hideWeekdays: true });
		},
		$$slots: { default: true }
	});

	$.pop();
}