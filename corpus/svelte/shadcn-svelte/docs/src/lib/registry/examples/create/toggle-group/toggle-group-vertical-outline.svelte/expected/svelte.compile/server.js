import * as $ from 'svelte/internal/server';
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Toggle_group_vertical_outline($$renderer) {
	let value = "all";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Vertical Outline',
			children: ($$renderer) => {
				if (ToggleGroup.Root) {
					$$renderer.push('<!--[-->');

					ToggleGroup.Root($$renderer, {
						variant: 'outline',
						type: 'single',
						orientation: 'vertical',
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
									'aria-label': 'Toggle all',
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
									'aria-label': 'Toggle active',
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
									'aria-label': 'Toggle completed',
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
									'aria-label': 'Toggle archived',
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