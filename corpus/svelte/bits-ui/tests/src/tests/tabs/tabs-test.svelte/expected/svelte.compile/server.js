import * as $ from 'svelte/internal/server';
import { Tabs } from "bits-ui";

export default function Tabs_test($$renderer, $$props) {
	let { value = "1", items, $$slots, $$events, ...restProps } = $$props;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main>`);

		if (Tabs.Root) {
			$$renderer.push('<!--[-->');

			Tabs.Root($$renderer, $.spread_props([
				{ 'aria-label': 'airplane mode', 'data-testid': 'root' },
				restProps,
				{
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								'data-testid': 'list',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(items);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let { value, disabled } = each_array[$$index];

										if (Tabs.Trigger) {
											$$renderer.push('<!--[-->');

											Tabs.Trigger($$renderer, {
												value,
												disabled,
												'data-testid': `trigger-${$.stringify(value)}`,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(value)}`);
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

						$$renderer.push(` <!--[-->`);

						const each_array_1 = $.ensure_array_like(items);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let { value } = each_array_1[$$index_1];

							if (Tabs.Content) {
								$$renderer.push('<!--[-->');

								Tabs.Content($$renderer, {
									value,
									'data-testid': `content-${$.stringify(value)}`,
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(value)}`);
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
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <button data-testid="binding">${$.escape(value)}</button></main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}