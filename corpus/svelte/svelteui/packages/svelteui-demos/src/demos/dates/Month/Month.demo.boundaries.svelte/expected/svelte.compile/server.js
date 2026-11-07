import * as $ from 'svelte/internal/server';
import { Group } from '@svelteuidev/core';
import { Month } from '@svelteuidev/dates';
import dayjs from 'dayjs';

const code = `
<script>
	import { Month } from '@svelteuidev/dates';
	import dayjs from 'dayjs';

	const initialDate = dayjs(new Date()).startOf('month').add(10, 'days').toDate();
	let value = initialDate;
<\/script>

<Month
    month={value}
    {value}
    onChange={(val) => (value = val)}
    minDate={dayjs(new Date()).startOf('month').add(5, 'days').toDate()}
    maxDate={dayjs(new Date()).endOf('month').subtract(5, 'days').toDate()}
/>
`;

export const type = 'demo';
export const configuration = { code };

export default function Month_demo_boundaries($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const initialDate = dayjs(new Date()).startOf('month').add(10, 'days').toDate();
		let value = initialDate;

		Group($$renderer, {
			position: 'center',
			children: ($$renderer) => {
				Month($$renderer, {
					month: value,
					value,
					onChange: (val) => value = val,
					minDate: dayjs(new Date()).startOf('month').add(5, 'days').toDate(),
					maxDate: dayjs(new Date()).endOf('month').subtract(5, 'days').toDate()
				});
			},
			$$slots: { default: true }
		});
	});
}