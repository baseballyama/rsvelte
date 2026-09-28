import * as $ from 'svelte/internal/server';
import * as DocTabs from "./doc-tabs/index.js";
import CodeTabs from "./code-tabs.svelte";

export default function Install_tabs($$renderer, $$props) {
	let { cli, manual } = $$props;

	$$renderer.push(`<div class="-ms-2 md:ms-0">`);

	CodeTabs($$renderer, {
		children: ($$renderer) => {
			if (DocTabs.List) {
				$$renderer.push('<!--[-->');

				DocTabs.List($$renderer, {
					children: ($$renderer) => {
						if (DocTabs.Trigger) {
							$$renderer.push('<!--[-->');

							DocTabs.Trigger($$renderer, {
								value: 'cli',
								children: ($$renderer) => {
									$$renderer.push(`<!---->CLI`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (DocTabs.Trigger) {
							$$renderer.push('<!--[-->');

							DocTabs.Trigger($$renderer, {
								value: 'manual',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Manual`);
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

			if (DocTabs.Content) {
				$$renderer.push('<!--[-->');

				DocTabs.Content($$renderer, {
					value: 'cli',
					class: 'ms-2 md:ms-0',
					children: ($$renderer) => {
						cli?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (DocTabs.Content) {
				$$renderer.push('<!--[-->');

				DocTabs.Content($$renderer, {
					class: 'ms-2 md:ms-0',
					value: 'manual',
					'data-manual-install': '',
					'data-llm-ignore': true,
					children: ($$renderer) => {
						manual?.($$renderer);
						$$renderer.push(`<!---->`);
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