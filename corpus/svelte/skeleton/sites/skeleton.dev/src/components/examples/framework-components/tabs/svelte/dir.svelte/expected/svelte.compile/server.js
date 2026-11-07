import * as $ from 'svelte/internal/server';
import { Tabs } from '@skeletonlabs/skeleton-svelte';

export default function Dir($$renderer) {
	Tabs($$renderer, {
		defaultValue: 'overview',
		dir: 'rtl',
		children: ($$renderer) => {
			if (Tabs.List) {
				$$renderer.push('<!--[-->');

				Tabs.List($$renderer, {
					children: ($$renderer) => {
						if (Tabs.Trigger) {
							$$renderer.push('<!--[-->');

							Tabs.Trigger($$renderer, {
								value: 'overview',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Overview`);
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
								value: 'features',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Key features`);
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
								value: 'activity',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Activity`);
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
					value: 'overview',
					children: ($$renderer) => {
						$$renderer.push(`<!---->A concise overview of the project: usage, goals, and recent highlights. Use this area to orient readers with key metrics and links to
		deeper docs.`);
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
					value: 'features',
					children: ($$renderer) => {
						$$renderer.push(`<!---->List the most important features here with short, pragmatic descriptions so readers can scan for what matters (accessibility, theming,
		integrations).`);
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
					value: 'activity',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Show recent activity or sample data: new releases, PRs merged, or notable user events. This helps examples feel realistic and
		actionable.`);
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