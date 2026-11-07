import * as $ from 'svelte/internal/server';
import { Group } from '@svelteuidev/core';
import { Month } from '@svelteuidev/dates';
import dayjs from 'dayjs';

const code = `
<script>
    import dayjs from 'dayjs';
    import { Month } from '@svelteuidev/dates';
<\/script>

<Month>
    month={new Date()}
    range={[
    	dayjs(new Date()).startOf('month').toDate(),
    	dayjs(new Date()).startOf('month').add(4, 'days').toDate(),
    ]}
/>
`;

export const type = 'demo';
export const configuration = { code };

export default function Month_demo_range($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Group($$renderer, {
			position: 'center',
			children: ($$renderer) => {
				Month($$renderer, {
					month: new Date(),
					range: [
						dayjs(new Date()).startOf('month').toDate(),
						dayjs(new Date()).startOf('month').add(4, 'days').toDate()
					]
				});
			},
			$$slots: { default: true }
		});
	});
}