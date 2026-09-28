import * as $ from 'svelte/internal/server';
import * as UnderlineTabs from '$lib/components/ui/underline-tabs';

export default function Underline_tabs($$renderer) {
	$$renderer.push(`<div class="relative w-full max-w-[458px]">`);

	if (UnderlineTabs.Root) {
		$$renderer.push('<!--[-->');

		UnderlineTabs.Root($$renderer, {
			value: 'overview',
			children: ($$renderer) => {
				if (UnderlineTabs.List) {
					$$renderer.push('<!--[-->');

					UnderlineTabs.List($$renderer, {
						children: ($$renderer) => {
							if (UnderlineTabs.Trigger) {
								$$renderer.push('<!--[-->');

								UnderlineTabs.Trigger($$renderer, {
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

							if (UnderlineTabs.Trigger) {
								$$renderer.push('<!--[-->');

								UnderlineTabs.Trigger($$renderer, {
									value: 'deployments',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Deployments`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (UnderlineTabs.Trigger) {
								$$renderer.push('<!--[-->');

								UnderlineTabs.Trigger($$renderer, {
									value: 'analytics',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Analytics`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (UnderlineTabs.Trigger) {
								$$renderer.push('<!--[-->');

								UnderlineTabs.Trigger($$renderer, {
									value: 'speed-insights',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Speed Insights`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (UnderlineTabs.Trigger) {
								$$renderer.push('<!--[-->');

								UnderlineTabs.Trigger($$renderer, {
									value: 'logs',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Logs`);
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

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}