import * as $ from 'svelte/internal/server';
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Toggle_group_sizes($$renderer) {
	let value1 = "top";
	let value2 = "top";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Sizes',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex flex-col gap-4">`);

				if (ToggleGroup.Root) {
					$$renderer.push('<!--[-->');

					ToggleGroup.Root($$renderer, {
						size: 'sm',
						type: 'single',
						variant: 'outline',
						get value() {
							return value1;
						},

						set value($$value) {
							value1 = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (ToggleGroup.Item) {
								$$renderer.push('<!--[-->');

								ToggleGroup.Item($$renderer, {
									value: 'top',
									'aria-label': 'Toggle top',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Top`);
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
									value: 'bottom',
									'aria-label': 'Toggle bottom',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Bottom`);
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
									value: 'left',
									'aria-label': 'Toggle left',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Left`);
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
									value: 'right',
									'aria-label': 'Toggle right',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Right`);
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

				$$renderer.push(` `);

				if (ToggleGroup.Root) {
					$$renderer.push('<!--[-->');

					ToggleGroup.Root($$renderer, {
						type: 'single',
						variant: 'outline',
						get value() {
							return value2;
						},

						set value($$value) {
							value2 = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (ToggleGroup.Item) {
								$$renderer.push('<!--[-->');

								ToggleGroup.Item($$renderer, {
									value: 'top',
									'aria-label': 'Toggle top',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Top`);
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
									value: 'bottom',
									'aria-label': 'Toggle bottom',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Bottom`);
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
									value: 'left',
									'aria-label': 'Toggle left',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Left`);
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
									value: 'right',
									'aria-label': 'Toggle right',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Right`);
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