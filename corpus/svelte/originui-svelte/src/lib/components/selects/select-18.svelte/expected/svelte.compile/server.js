import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';

export default function Select_18($$renderer) {
	const uid = $.props_id($$renderer);

	const items = [
		{ label: 'Svelte', value: 's1' },
		{ label: 'Next.js', value: 's2' },
		{ label: 'Astro', value: 's3' },
		{ label: 'Gatsby', value: 's4' }
	];

	let value = 's3';
	const selected = $.derived(() => items.find((i) => i.value === value));
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="space-y-2">`);

		Label($$renderer, {
			for: uid,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Select with helper text`);
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
								$$renderer.push(`<!---->${$.escape(selected()?.label ?? 'Select a framework')}`);
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

		$$renderer.push(` <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Tell us what‘s your favorite</p></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}