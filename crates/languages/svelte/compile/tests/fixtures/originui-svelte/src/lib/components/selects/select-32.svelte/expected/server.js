import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';

function status($$renderer, item) {
	$$renderer.push(`<span class="flex items-center gap-2"><svg width="8" height="8" fill="currentColor" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"${$.attr_class($.clsx(item.class))} aria-hidden="true"><circle cx="4" cy="4" r="4"></circle></svg> <span class="truncate">${$.escape(item.label)}</span></span>`);
}

export default function Select_32($$renderer) {
	const uid = $.props_id($$renderer);

	const items = [
		{ class: 'text-emerald-600', label: 'Completed', value: 's1' },
		{ class: 'text-blue-500', label: 'In Progress', value: 's2' },
		{ class: 'text-amber-500', label: 'Pending', value: 's3' },
		{ class: 'text-gray-500', label: 'Cancelled', value: 's4' },
		{ class: 'text-red-500', label: 'Failed', value: 's5' }
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
				$$renderer.push(`<!---->Status select`);
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
							class: '[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0',
							children: ($$renderer) => {
								if (selected()) {
									$$renderer.push('<!--[0-->');
									status($$renderer, selected());
								} else {
									$$renderer.push(`<!--[-1-->Select a status`);
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

					$$renderer.push(` `);

					if (Select.Content) {
						$$renderer.push('<!--[-->');

						Select.Content($$renderer, {
							class: '[&_*[data-select-item]>span>svg]:text-muted-foreground/80 [&_*[data-select-item]]:ps-2 [&_*[data-select-item]]:pe-8 [&_*[data-select-item]>span]:start-auto [&_*[data-select-item]>span]:end-2 [&_*[data-select-item]>span]:flex [&_*[data-select-item]>span]:items-center [&_*[data-select-item]>span]:gap-2 [&_*[data-select-item]>span>svg]:shrink-0',
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
												status($$renderer, item);
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