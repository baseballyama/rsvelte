import * as $ from 'svelte/internal/server';
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Tabs_with_input_and_button($$renderer) {
	Example($$renderer, {
		title: 'With Input and Button',
		containerClass: 'col-span-full',
		children: ($$renderer) => {
			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					value: 'overview',
					class: 'mx-auto w-full max-w-lg',
					children: ($$renderer) => {
						$$renderer.push(`<div class="flex items-center gap-4">`);

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
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` <div class="ml-auto flex items-center gap-2">`);
						Input($$renderer, { placeholder: 'Search...', class: 'w-44' });
						$$renderer.push(`<!----> `);

						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Action`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div> <div class="border style-vega:rounded-lg style-vega:p-6 style-nova:rounded-lg style-nova:p-4 style-lyra:rounded-none style-lyra:p-4 style-maia:rounded-xl style-maia:p-6 style-mira:rounded-md style-mira:p-4 style-luma:rounded-xl style-luma:p-6 style-rhea:rounded-xl style-rhea:p-6">`);

						if (Tabs.Content) {
							$$renderer.push('<!--[-->');

							Tabs.Content($$renderer, {
								value: 'overview',
								children: ($$renderer) => {
									$$renderer.push(`<!---->View your dashboard metrics and key performance indicators.`);
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
								value: 'analytics',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Detailed analytics and insights about your data.`);
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
								value: 'reports',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Generate and view custom reports.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div>`);
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