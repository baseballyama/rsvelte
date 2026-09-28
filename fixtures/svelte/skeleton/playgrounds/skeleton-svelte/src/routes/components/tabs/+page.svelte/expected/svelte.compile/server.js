import * as $ from 'svelte/internal/server';
import { Tabs } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer) {
	Tabs($$renderer, {
		defaultValue: 'tab-1',
		children: ($$renderer) => {
			if (Tabs.List) {
				$$renderer.push('<!--[-->');

				Tabs.List($$renderer, {
					children: ($$renderer) => {
						if (Tabs.Trigger) {
							$$renderer.push('<!--[-->');

							Tabs.Trigger($$renderer, {
								value: 'tab-1',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Tab 1`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tabs.Trigger) {
							$$renderer.push('<!--[-->');

							Tabs.Trigger($$renderer, {
								value: 'tab-2',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Tab 2`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tabs.Trigger) {
							$$renderer.push('<!--[-->');

							Tabs.Trigger($$renderer, {
								value: 'tab-3',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Tab 3`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tabs.Indicator) {
							$$renderer.push('<!--[-->');
							Tabs.Indicator($$renderer, {});
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

			if (Tabs.Content) {
				$$renderer.push('<!--[-->');

				Tabs.Content($$renderer, {
					value: 'tab-1',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Content for Tab 1`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Tabs.Content) {
				$$renderer.push('<!--[-->');

				Tabs.Content($$renderer, {
					value: 'tab-2',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Content for Tab 2`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Tabs.Content) {
				$$renderer.push('<!--[-->');

				Tabs.Content($$renderer, {
					value: 'tab-3',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Content for Tab 3`);
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