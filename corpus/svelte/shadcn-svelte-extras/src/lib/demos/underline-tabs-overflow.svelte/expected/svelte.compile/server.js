import * as $ from 'svelte/internal/server';
import * as UnderlineTabs from '$lib/components/ui/underline-tabs';
import { Window } from '$lib/components/ui/window';

export default function Underline_tabs_overflow($$renderer) {
	$$renderer.push(`<div class="flex w-full max-w-full items-center justify-center p-6">`);

	Window($$renderer, {
		class: 'max-w-lg',
		contentClass: 'px-0 py-1',
		children: ($$renderer) => {
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

									$$renderer.push(` `);

									if (UnderlineTabs.Trigger) {
										$$renderer.push('<!--[-->');

										UnderlineTabs.Trigger($$renderer, {
											value: 'observability',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Observability`);
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
											value: 'firewall',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Firewall`);
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
											value: 'ai-gateway',
											children: ($$renderer) => {
												$$renderer.push(`<!---->AI Gateway`);
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
											value: 'storage',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Storage`);
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
											value: 'flags',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Flags`);
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
											value: 'settings',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Settings`);
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
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}