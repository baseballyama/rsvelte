import * as $ from 'svelte/internal/server';
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Toggle_group_filter($$renderer) {
	let value = "all";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Filter',
			children: ($$renderer) => {
				if (ToggleGroup.Root) {
					$$renderer.push('<!--[-->');

					ToggleGroup.Root($$renderer, {
						type: 'single',
						variant: 'outline',
						size: 'sm',
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
									value: 'all',
									'aria-label': 'All',
									children: ($$renderer) => {
										$$renderer.push(`<!---->All`);
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
									value: 'active',
									'aria-label': 'Active',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Active`);
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
									value: 'completed',
									'aria-label': 'Completed',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Completed`);
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
									value: 'archived',
									'aria-label': 'Archived',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Archived`);
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