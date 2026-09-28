import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';

export default function Select_30($$renderer, $$props) {
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

		let value = 'Europe/London';
		const selected = $.derived(() => timezones.find((i) => i.value === value));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-2">`);

			Label($$renderer, {
				for: uid,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Timezone select`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								id: uid,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(selected()?.label ?? 'Select a timezone')}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Select.Content) {
							$$renderer.push('<!--[-->');

							Select.Content($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(timezones);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let item = each_array[$$index];

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: item.value,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(item.label)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}