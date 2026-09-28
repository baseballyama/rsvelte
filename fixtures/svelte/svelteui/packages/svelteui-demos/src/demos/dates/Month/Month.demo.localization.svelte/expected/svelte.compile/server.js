import * as $ from 'svelte/internal/server';
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

export default function Month_demo_localization($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = new Date();

		Group($$renderer, {
			position: 'center',
			children: ($$renderer) => {
				Month($$renderer, {
					month: value,
					value,
					onChange: (val) => value = val,
					locale: 'ru'
				});
			},
			$$slots: { default: true }
		});
	});
}