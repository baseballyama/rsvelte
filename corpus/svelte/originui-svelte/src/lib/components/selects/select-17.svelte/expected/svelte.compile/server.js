import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';
import Clock from '@lucide/svelte/icons/clock';

export default function Select_17($$renderer) {
	const uid = $.props_id($$renderer);

	const items = [
		{ label: '00:00 AM - 11:59 PM', value: 's1' },
		{ label: '01:00 AM - 12:59 PM', value: 's2' },
		{ label: '02:00 AM - 01:59 PM', value: 's3' },
		{ label: '03:00 AM - 02:59 PM', value: 's4' }
	];

	let value = 's1';
	const selected = $.derived(() => items.find((i) => i.value === value));
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="space-y-2">`);

		Label($$renderer, {
			for: uid,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Select with icon`);
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
							class: 'relative ps-9',
							id: uid,
							children: ($$renderer) => {
								$$renderer.push(`<div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[[disabled]]:opacity-50">`);
								Clock($$renderer, { size: 16, 'aria-hidden': 'true' });
								$$renderer.push(`<!----></div> ${$.escape(selected()?.label ?? 'Select a time')}`);
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

								const each_array = $.ensure_array_like(items);

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
}