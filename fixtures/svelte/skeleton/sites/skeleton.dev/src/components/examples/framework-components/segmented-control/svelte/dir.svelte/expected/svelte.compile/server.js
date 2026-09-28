import * as $ from 'svelte/internal/server';
import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';

export default function Dir($$renderer) {
	SegmentedControl($$renderer, {
		defaultValue: 'item-1',
		dir: 'rtl',
		children: ($$renderer) => {
			if (SegmentedControl.Label) {
				$$renderer.push('<!--[-->');

				SegmentedControl.Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

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
								value: 'item-1',
								children: ($$renderer) => {
									if (SegmentedControl.ItemText) {
										$$renderer.push('<!--[-->');

										SegmentedControl.ItemText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Item 1`);
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
								value: 'item-2',
								children: ($$renderer) => {
									if (SegmentedControl.ItemText) {
										$$renderer.push('<!--[-->');

										SegmentedControl.ItemText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Item 2`);
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
								value: 'item-3',
								children: ($$renderer) => {
									if (SegmentedControl.ItemText) {
										$$renderer.push('<!--[-->');

										SegmentedControl.ItemText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Item 3`);
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