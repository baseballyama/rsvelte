import * as $ from 'svelte/internal/server';
import * as Alert from "$lib/registry/ui/alert/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Alert_with_icons($$renderer) {
	Example($$renderer, {
		title: 'With Icons',
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
									$$renderer.push(`<!---->Let's try one with icon, title and a <a href="#/">link</a>.`);
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

						if (Alert.Description) {
							$$renderer.push('<!--[-->');

							Alert.Description($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->This one has an icon and a description only. No title. <a href="#/">But it has a link</a> and a <a href="#/">second link</a>.`);
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
									$$renderer.push(`<!---->Success! Your changes have been saved`);
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
									$$renderer.push(`<!---->This is an alert with icon, title and description.`);
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
									$$renderer.push(`<!---->This is a very long alert title that demonstrates how the component handles extended text
				content and potentially wraps across multiple lines`);
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

						if (Alert.Description) {
							$$renderer.push('<!--[-->');

							Alert.Description($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->This is a very long alert description that demonstrates how the component handles extended
				text content and potentially wraps across multiple lines`);
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
									$$renderer.push(`<!---->This is an extremely long alert title that spans multiple lines to demonstrate how the
				component handles very lengthy headings while maintaining readability and proper text
				wrapping behavior`);
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
									$$renderer.push(`<!---->This is an equally long description that contains detailed information about the alert. It
				shows how the component can accommodate extensive content while preserving proper spacing,
				alignment, and readability across different screen sizes and viewport widths. This helps
				ensure the user experience remains consistent regardless of the content length.`);
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