import * as $ from 'svelte/internal/server';
import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';

export default function Default($$renderer) {
	let value = 'music';

	$$renderer.push(`<div class="flex flex-col items-center gap-4">`);

	SegmentedControl($$renderer, {
		value,
		onValueChange: (details) => value = details.value,
		children: ($$renderer) => {
			if (SegmentedControl.Label) {
				$$renderer.push('<!--[-->');

				SegmentedControl.Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Browse`);
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

	$$renderer.push(`<!----> <p><span class="opacity-60">You selected</span> <code class="code">${$.escape(value)}</code></p></div>`);
}