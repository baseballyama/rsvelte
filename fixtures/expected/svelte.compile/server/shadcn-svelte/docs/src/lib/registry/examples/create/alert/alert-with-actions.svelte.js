import * as $ from 'svelte/internal/server';
import * as Alert from "$lib/registry/ui/alert/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Alert_with_actions($$renderer) {
	Example($$renderer, {
		title: 'With Actions',
		children: ($$renderer) => {
			$$renderer.push(`<div class="mx-auto flex w-full max-w-lg flex-col gap-4">`);

			if (Alert.Root) {
				$$renderer.push('<!--[-->');

				Alert.Root($$renderer, {
					children: ($$renderer) => {
						IconPlaceholder($$renderer, {
							lucide: 'CircleAlertIcon',
							tabler: 'IconExclamationCircle',
							hugeicons: 'AlertCircleIcon',
							phosphor: 'WarningCircleIcon',
							remixicon: 'RiErrorWarningLine'
						});

						$$renderer.push(`<!----> `);

						if (Alert.Title) {
							$$renderer.push('<!--[-->');

							Alert.Title($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->The selected emails have been marked as spam.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Alert.Action) {
							$$renderer.push('<!--[-->');

							Alert.Action($$renderer, {
								children: ($$renderer) => {
									Button($$renderer, {
										size: 'xs',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Undo`);
										},
										$$slots: { default: true }
									});
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

			$$renderer.push(` `);

			if (Alert.Root) {
				$$renderer.push('<!--[-->');

				Alert.Root($$renderer, {
					children: ($$renderer) => {
						IconPlaceholder($$renderer, {
							lucide: 'CircleAlertIcon',
							tabler: 'IconExclamationCircle',
							hugeicons: 'AlertCircleIcon',
							phosphor: 'WarningCircleIcon',
							remixicon: 'RiErrorWarningLine'
						});

						$$renderer.push(`<!----> `);

						if (Alert.Title) {
							$$renderer.push('<!--[-->');

							Alert.Title($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->The selected emails have been marked as spam.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Alert.Description) {
							$$renderer.push('<!--[-->');

							Alert.Description($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->This is a very long alert title that demonstrates how the component handles extended text
				content.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Alert.Action) {
							$$renderer.push('<!--[-->');

							Alert.Action($$renderer, {
								children: ($$renderer) => {
									Badge($$renderer, {
										variant: 'secondary',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Badge`);
										},
										$$slots: { default: true }
									});
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
		},
		$$slots: { default: true }
	});
}