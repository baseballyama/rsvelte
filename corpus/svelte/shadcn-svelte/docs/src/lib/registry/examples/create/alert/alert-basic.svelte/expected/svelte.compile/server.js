import * as $ from 'svelte/internal/server';
import * as Alert from "$lib/registry/ui/alert/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Alert_basic($$renderer) {
	Example($$renderer, {
		title: 'Basic',
		children: ($$renderer) => {
			$$renderer.push(`<div class="mx-auto flex w-full max-w-lg flex-col gap-4">`);

			if (Alert.Root) {
				$$renderer.push('<!--[-->');

				Alert.Root($$renderer, {
					children: ($$renderer) => {
						if (Alert.Title) {
							$$renderer.push('<!--[-->');

							Alert.Title($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Success! Your changes have been saved.`);
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
						if (Alert.Title) {
							$$renderer.push('<!--[-->');

							Alert.Title($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Success! Your changes have been saved.`);
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
									$$renderer.push(`<!---->This is an alert with title and description.`);
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
						if (Alert.Description) {
							$$renderer.push('<!--[-->');

							Alert.Description($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->This one has a description only. No title. No icon.`);
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