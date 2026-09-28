import * as $ from 'svelte/internal/server';
import AlignCenterVerticalIcon from '@lucide/svelte/icons/align-center-vertical';
import AlignEndVerticalIcon from '@lucide/svelte/icons/align-end-vertical';
import AlignStartVerticalIcon from '@lucide/svelte/icons/align-start-vertical';
import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';

export default function Icons($$renderer) {
	SegmentedControl($$renderer, {
		defaultValue: 'start',
		children: ($$renderer) => {
			if (SegmentedControl.Control) {
				$$renderer.push('<!--[-->');

				SegmentedControl.Control($$renderer, {
					children: ($$renderer) => {
						if (SegmentedControl.Indicator) {
							$$renderer.push('<!--[-->');
							SegmentedControl.Indicator($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (SegmentedControl.Item) {
							$$renderer.push('<!--[-->');

							SegmentedControl.Item($$renderer, {
								value: 'start',
								title: 'start',
								'aria-label': 'start',
								children: ($$renderer) => {
									if (SegmentedControl.ItemText) {
										$$renderer.push('<!--[-->');

										SegmentedControl.ItemText($$renderer, {
											children: ($$renderer) => {
												AlignStartVerticalIcon($$renderer, { class: 'size-4' });
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (SegmentedControl.ItemHiddenInput) {
										$$renderer.push('<!--[-->');
										SegmentedControl.ItemHiddenInput($$renderer, {});
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

						if (SegmentedControl.Item) {
							$$renderer.push('<!--[-->');

							SegmentedControl.Item($$renderer, {
								value: 'center',
								title: 'center',
								'aria-label': 'center',
								children: ($$renderer) => {
									if (SegmentedControl.ItemText) {
										$$renderer.push('<!--[-->');

										SegmentedControl.ItemText($$renderer, {
											children: ($$renderer) => {
												AlignCenterVerticalIcon($$renderer, { class: 'size-4' });
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (SegmentedControl.ItemHiddenInput) {
										$$renderer.push('<!--[-->');
										SegmentedControl.ItemHiddenInput($$renderer, {});
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

						if (SegmentedControl.Item) {
							$$renderer.push('<!--[-->');

							SegmentedControl.Item($$renderer, {
								value: 'end',
								title: 'end',
								'aria-label': 'end',
								children: ($$renderer) => {
									if (SegmentedControl.ItemText) {
										$$renderer.push('<!--[-->');

										SegmentedControl.ItemText($$renderer, {
											children: ($$renderer) => {
												AlignEndVerticalIcon($$renderer, { class: 'size-4' });
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (SegmentedControl.ItemHiddenInput) {
										$$renderer.push('<!--[-->');
										SegmentedControl.ItemHiddenInput($$renderer, {});
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
		},
		$$slots: { default: true }
	});
}