import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import SelectNative from '$lib/components/ui/select-native.svelte';

export default function Select_12($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		const timezones = Intl.supportedValuesOf('timeZone').map((timezone) => {
			const formatter = new Intl.DateTimeFormat('en', { timeZone: timezone, timeZoneName: 'shortOffset' });
			const parts = formatter.formatToParts(new Date());
			const offset = parts.find((part) => part.type === 'timeZoneName')?.value || '';
			const modifiedOffset = offset === 'GMT' ? 'GMT+0' : offset;

			return {
				label: `(${modifiedOffset}) ${timezone.replace(/_/g, ' ')}`,
				numericOffset: parseInt(offset.replace('GMT', '').replace('+', '') || '0'),
				value: timezone
			};
		}).sort((a, b) => a.numericOffset - b.numericOffset);

		$$renderer.push(`<div class="space-y-2">`);

		Label($$renderer, {
			for: uid,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Timezone select (native)`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		SelectNative($$renderer, {
			id: uid,
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(timezones);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					$$renderer.option({ value: item.value, selected: item.value == 'Europe/London' }, ($$renderer) => {
						$$renderer.push(`${$.escape(item.label)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}