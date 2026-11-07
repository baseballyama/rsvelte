import * as $ from 'svelte/internal/server';
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Tabs_multiple($$renderer) {
	Example($$renderer, {
		title: 'Multiple',
		children: ($$renderer) => {
			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					value: 'overview',
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

									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'reports',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Reports`);
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
}