import * as $ from 'svelte/internal/server';
import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';

export default function Orientation($$renderer) {
	SegmentedControl($$renderer, {
		defaultValue: 'music',
		orientation: 'vertical',
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
								value: 'music',
								children: ($$renderer) => {
									if (SegmentedControl.ItemText) {
										$$renderer.push('<!--[-->');

										SegmentedControl.ItemText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Music`);
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
								value: 'images',
								children: ($$renderer) => {
									if (SegmentedControl.ItemText) {
										$$renderer.push('<!--[-->');

										SegmentedControl.ItemText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Images`);
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
								value: 'videos',
								children: ($$renderer) => {
									if (SegmentedControl.ItemText) {
										$$renderer.push('<!--[-->');

										SegmentedControl.ItemText($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Videos`);
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