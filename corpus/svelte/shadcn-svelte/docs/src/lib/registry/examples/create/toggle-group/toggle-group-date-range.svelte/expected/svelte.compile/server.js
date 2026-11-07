import * as $ from 'svelte/internal/server';
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Toggle_group_date_range($$renderer) {
	let value = "today";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Date Range',
			children: ($$renderer) => {
				if (ToggleGroup.Root) {
					$$renderer.push('<!--[-->');

					ToggleGroup.Root($$renderer, {
						type: 'single',
						variant: 'outline',
						size: 'sm',
						spacing: 2,
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (ToggleGroup.Item) {
								$$renderer.push('<!--[-->');

								ToggleGroup.Item($$renderer, {
									value: 'today',
									'aria-label': 'Today',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Today`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (ToggleGroup.Item) {
								$$renderer.push('<!--[-->');

								ToggleGroup.Item($$renderer, {
									value: 'week',
									'aria-label': 'This Week',
									children: ($$renderer) => {
										$$renderer.push(`<!---->This Week`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (ToggleGroup.Item) {
								$$renderer.push('<!--[-->');

								ToggleGroup.Item($$renderer, {
									value: 'month',
									'aria-label': 'This Month',
									children: ($$renderer) => {
										$$renderer.push(`<!---->This Month`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (ToggleGroup.Item) {
								$$renderer.push('<!--[-->');

								ToggleGroup.Item($$renderer, {
									value: 'year',
									'aria-label': 'This Year',
									children: ($$renderer) => {
										$$renderer.push(`<!---->This Year`);
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}