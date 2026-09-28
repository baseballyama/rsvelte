import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Month_demo_boundaries($$anchor, $$props) {
	$.push($$props, true);

	const initialDate = dayjs(new Date()).startOf('month').add(10, 'days').toDate();
	let value = initialDate;

	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => dayjs(new Date()).startOf('month').add(5, 'days').toDate());
				let $1 = $.derived(() => dayjs(new Date()).endOf('month').subtract(5, 'days').toDate());

				Month($$anchor, {
					get month() {
						return value;
					},

					get value() {
						return value;
					},
					onChange: (val) => value = val,
					get minDate() {
						return $.get($0);
					},

					get maxDate() {
						return $.get($1);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	$.pop();
}