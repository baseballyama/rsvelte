import * as $ from 'svelte/internal/server';
import { Tabs } from '@skeletonlabs/skeleton-svelte';

export default function Navigation($$renderer) {
	/**
	 * Because demonstrating navigation inside a code snippet is not feasible, this example uses local state to simulate URL path changes.
	 *
	 * In a real application, you would:
	 * - Replace the `url` variable with the `url` of the current page.
	 * - Replace `onValueChange={(details) => setUrl(details.value)}` with `navigate((details) => navigate(details.value))` using your framework's navigation method.
	 */
	let url = '#overview';

	Tabs($$renderer, {
		value: url,
		onValueChange: (details) => url = details.value,
		children: ($$renderer) => {
			if (Tabs.List) {
				$$renderer.push('<!--[-->');

				Tabs.List($$renderer, {
					children: ($$renderer) => {
						{
							function element($$renderer, attributes) {
								$$renderer.push(`<a${$.attributes({ ...attributes, href: '#overview' })}>Overview</a>`);
							}

							if (Tabs.Trigger) {
								$$renderer.push('<!--[-->');
								Tabs.Trigger($$renderer, { value: '#overview', element, $$slots: { element: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						{
							function element($$renderer, attributes) {
								$$renderer.push(`<a${$.attributes({ ...attributes, href: '#key-features' })}>Key Features</a>`);
							}

							if (Tabs.Trigger) {
								$$renderer.push('<!--[-->');
								Tabs.Trigger($$renderer, { value: '#key-features', element, $$slots: { element: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						{
							function element($$renderer, attributes) {
								$$renderer.push(`<a${$.attributes({ ...attributes, href: '#activity' })}>Activity</a>`);
							}

							if (Tabs.Trigger) {
								$$renderer.push('<!--[-->');
								Tabs.Trigger($$renderer, { value: '#activity', element, $$slots: { element: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
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
					value: '#overview',
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
					value: '#key-features',
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
					value: '#activity',
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