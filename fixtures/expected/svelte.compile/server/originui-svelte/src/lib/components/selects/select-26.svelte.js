import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';

export default function Select_26($$renderer) {
	const uid = $.props_id($$renderer);

	const frontend = [
		{ label: 'Svelte', value: 's1' },
		{ label: 'Vue', value: 's2' },
		{ label: 'Angular', value: 's3' }
	];

	const backend = [
		{ label: 'Node.js', value: 's4' },
		{ label: 'Python', value: 's5' },
		{ label: 'Java', value: 's6' }
	];

	const items = [...frontend, ...backend];
	let value = 's1';
	const selected = $.derived(() => items.find((i) => i.value === value));
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="space-y-2">`);

		Label($$renderer, {
			for: uid,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Select with separator`);
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
								if (Select.Group) {
									$$renderer.push('<!--[-->');

									Select.Group($$renderer, {
										children: ($$renderer) => {
											if (Select.GroupHeading) {
												$$renderer.push('<!--[-->');

												Select.GroupHeading($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Frontend`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` <!--[-->`);

											const each_array = $.ensure_array_like(frontend);

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

								$$renderer.push(` `);

								if (Select.Separator) {
									$$renderer.push('<!--[-->');
									Select.Separator($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Select.Group) {
									$$renderer.push('<!--[-->');

									Select.Group($$renderer, {
										children: ($$renderer) => {
											if (Select.GroupHeading) {
												$$renderer.push('<!--[-->');

												Select.GroupHeading($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Backend`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` <!--[-->`);

											const each_array_1 = $.ensure_array_like(backend);

											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let item = each_array_1[$$index_1];

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