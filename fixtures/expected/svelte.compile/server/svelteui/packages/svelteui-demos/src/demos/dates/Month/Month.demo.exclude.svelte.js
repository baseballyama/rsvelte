import * as $ from 'svelte/internal/server';
import { Group } from '@svelteuidev/core';
import { Month } from '@svelteuidev/dates';

const code = `
<script>
    import { Month } from '@svelteuidev/dates';

    let value = new Date()
<\/script>

<Month
    month={value}
    value={value}
    onChange={(val) => (value = val)}
    excludeDate={(date) => date.getDay() === 0 || date.getDay() === 6}
/>
`;

export const type = 'demo';
export const configuration = { code };

export default function Month_demo_exclude($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = new Date();

		Group($$renderer, {
			position: 'center',
			children: ($$renderer) => {
				Month($$renderer, {
					month: value,
					value,
					onChange: (val) => value = val,
					excludeDate: (date) => date.getDay() === 0 || date.getDay() === 6
				});
			},
			$$slots: { default: true }
		});
	});
}