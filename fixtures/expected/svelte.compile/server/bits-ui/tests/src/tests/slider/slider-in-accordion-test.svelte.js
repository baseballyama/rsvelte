import * as $ from 'svelte/internal/server';
import { Accordion, Slider } from "bits-ui";

export default function Slider_in_accordion_test($$renderer) {
	const items = ["1", "2", "3"];

	if (Accordion.Root) {
		$$renderer.push('<!--[-->');

		Accordion.Root($$renderer, {
			type: 'multiple',
			value: ["1"],
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
					let item = each_array[$$index_1];

					if (Accordion.Item) {
						$$renderer.push('<!--[-->');

						Accordion.Item($$renderer, {
							value: item,
							children: ($$renderer) => {
								if (Accordion.Header) {
									$$renderer.push('<!--[-->');

									Accordion.Header($$renderer, {
										children: ($$renderer) => {
											if (Accordion.Trigger) {
												$$renderer.push('<!--[-->');

												Accordion.Trigger($$renderer, {
													'data-testid': `${$.stringify(item)}-trigger`,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Slider ${$.escape(item)}`);
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

								if (Accordion.Content) {
									$$renderer.push('<!--[-->');

									Accordion.Content($$renderer, {
										'data-testid': `${$.stringify(item)}-content`,
										children: ($$renderer) => {
											$$renderer.push(`<div style="padding: 8px 0;">`);

											{
												function children($$renderer, { thumbItems }) {
													$$renderer.push(`<span style="position: relative; height: 8px; width: 100%; flex-grow: 1; overflow: hidden;">`);

													if (Slider.Range) {
														$$renderer.push('<!--[-->');
														Slider.Range($$renderer, { 'data-testid': `range-${$.stringify(item)}` });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(`</span> <!--[-->`);

													const each_array_1 = $.ensure_array_like(thumbItems);

													for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
														let { index } = each_array_1[$$index];

														if (Slider.Thumb) {
															$$renderer.push('<!--[-->');

															Slider.Thumb($$renderer, {
																index,
																'data-testid': `thumb-${$.stringify(item)}`,
																style: 'display: block; width: 20px; height: 20px;'
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													$$renderer.push(`<!--]-->`);
												}

												if (Slider.Root) {
													$$renderer.push('<!--[-->');

													Slider.Root($$renderer, {
														type: 'single',
														value: 0,
														style: 'display: flex; width: 100px;',
														children,
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											$$renderer.push(`</div>`);
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
}