import * as $ from 'svelte/internal/server';
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Toggle_group_sort($$renderer) {
	let value = "newest";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Sort',
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
									value: 'newest',
									'aria-label': 'Newest',
									children: ($$renderer) => {
										IconPlaceholder($$renderer, {
											lucide: 'ArrowDownIcon',
											tabler: 'IconArrowDown',
											hugeicons: 'ArrowDownIcon',
											phosphor: 'ArrowDownIcon',
											remixicon: 'RiArrowDownLine'
										});

										$$renderer.push(`<!----> Newest`);
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
									value: 'oldest',
									'aria-label': 'Oldest',
									children: ($$renderer) => {
										IconPlaceholder($$renderer, {
											lucide: 'ArrowUpIcon',
											tabler: 'IconArrowUp',
											hugeicons: 'ArrowUpIcon',
											phosphor: 'ArrowUpIcon',
											remixicon: 'RiArrowUpLine'
										});

										$$renderer.push(`<!----> Oldest`);
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
									value: 'popular',
									'aria-label': 'Popular',
									children: ($$renderer) => {
										IconPlaceholder($$renderer, {
											lucide: 'TrendingUpIcon',
											tabler: 'IconTrendingUp',
											hugeicons: 'TradeUpIcon',
											phosphor: 'TrendUpIcon',
											remixicon: 'RiLineChartLine'
										});

										$$renderer.push(`<!----> Popular`);
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