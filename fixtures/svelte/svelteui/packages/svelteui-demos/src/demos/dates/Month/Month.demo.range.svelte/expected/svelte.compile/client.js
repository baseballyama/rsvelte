import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Month_demo_range($$anchor, $$props) {
	$.push($$props, true);

	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [
					dayjs(new Date()).startOf('month').toDate(),
					dayjs(new Date()).startOf('month').add(4, 'days').toDate()
				]);

				Month($$anchor, {
					month: new Date(),
					get range() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	$.pop();
}