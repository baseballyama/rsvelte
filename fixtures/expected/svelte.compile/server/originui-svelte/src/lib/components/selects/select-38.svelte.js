import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';
import { cn } from '$lib/utils.js';
import Avatar01 from '$lib/assets/avatar-40-01.jpg?w=40&h=40&enhanced';
import Avatar02 from '$lib/assets/avatar-40-02.jpg?w=40&h=40&enhanced';
import Avatar03 from '$lib/assets/avatar-40-03.jpg?w=40&h=40&enhanced';

function user($$renderer, item) {
	$$renderer.push(`<enhanced:img class="size-5 rounded"${$.attr('src', item.avatar)}${$.attr('alt', item.name)}></enhanced:img> <span class="truncate">${$.escape(item.name)}</span>`);
}

export default function Select_38($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		const items = [
			{ avatar: Avatar01, name: 'Jenny Hamilton', value: 's1' },
			{ avatar: Avatar02, name: 'Paul Smith', value: 's2' },
			{ avatar: Avatar03, name: 'Luna Wyen', value: 's3' }
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
					$$renderer.push(`<!---->Options with avatar`);
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
								class: cn('[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0', selected() && 'ps-2'),
								children: ($$renderer) => {
									if (selected()) {
										$$renderer.push('<!--[0-->');
										user($$renderer, selected());
									} else {
										$$renderer.push(`<!--[-1-->Select a user`);
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
								class: '[&_*[data-select-item]]:ps-2 [&_*[data-select-item]]:pe-8 [&_*[data-select-item]>span]:start-auto [&_*[data-select-item]>span]:end-2 [&_*[data-select-item]>span]:flex [&_*[data-select-item]>span]:items-center [&_*[data-select-item]>span]:gap-2',
								children: ($$renderer) => {
									if (Select.Group) {
										$$renderer.push('<!--[-->');

										Select.Group($$renderer, {
											children: ($$renderer) => {
												if (Select.GroupHeading) {
													$$renderer.push('<!--[-->');

													Select.GroupHeading($$renderer, {
														class: 'ps-2',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Impersonate user`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` <!--[-->`);

												const each_array = $.ensure_array_like(items);

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let item = each_array[$$index];

													if (Select.Item) {
														$$renderer.push('<!--[-->');

														Select.Item($$renderer, {
															value: item.value,
															children: ($$renderer) => {
																user($$renderer, item);
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