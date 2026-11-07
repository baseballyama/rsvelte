import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group } from '@svelteuidev/core';
import { Month } from '@svelteuidev/dates';
import 'dayjs/locale/ru';

const code = `
<script>
    import { Month } from '@svelteuidev/dates';
    import 'dayjs/locale/ru';

    let value = new Date()
<\/script>

<Month month={value} value={value} onChange={(val) => value = val} locale="ru" />
`;

export const type = 'demo';
export const configuration = { code };

export default function Month_demo_localization($$anchor, $$props) {
	$.push($$props, true);

	let value = new Date();

	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			Month($$anchor, {
				get month() {
					return value;
				},

				get value() {
					return value;
				},
				onChange: (val) => value = val,
				locale: 'ru'
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}