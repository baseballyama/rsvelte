import * as $ from 'svelte/internal/server';
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Tabs_with_icons($$renderer) {
	Example($$renderer, {
		title: 'With Icons',
		children: ($$renderer) => {
			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					value: 'preview',
					children: ($$renderer) => {
						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								children: ($$renderer) => {
									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'preview',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'AppWindowIcon',
													tabler: 'IconAppWindow',
													hugeicons: 'CursorInWindowIcon',
													phosphor: 'AppWindowIcon',
													remixicon: 'RiWindowLine'
												});

												$$renderer.push(`<!----> Preview`);
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
											value: 'code',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'CodeIcon',
													tabler: 'IconCode',
													hugeicons: 'CodeIcon',
													phosphor: 'CodeIcon',
													remixicon: 'RiCodeLine'
												});

												$$renderer.push(`<!----> Code`);
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