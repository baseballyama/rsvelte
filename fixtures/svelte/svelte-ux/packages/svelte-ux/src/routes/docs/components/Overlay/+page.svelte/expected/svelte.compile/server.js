import * as $ from 'svelte/internal/server';
import { Button, ProgressCircle, Overlay, Toggle } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Loading overlay</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="relative">`);

			Overlay($$renderer, {
				center: true,
				children: ($$renderer) => {
					ProgressCircle($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div>Some content</div> <div>Some content</div> <div>Some content</div> <div>Some content</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Change color</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="relative">`);

			Overlay($$renderer, {
				center: true,
				class: 'bg-surface-content/10',
				children: ($$renderer) => {
					ProgressCircle($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div>Some content</div> <div>Some content</div> <div>Some content</div> <div>Some content</div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Prompt</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: show, toggle }) => {
						$$renderer.push(`<div class="relative">`);

						if (show) {
							$$renderer.push('<!--[0-->');

							Overlay($$renderer, {
								center: true,
								children: ($$renderer) => {
									Button($$renderer, {
										class: 'border',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Close Overlay`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <div>Some content</div> <div>Some content</div> <div>Some content</div> <div>Some content</div> `);

						Button($$renderer, {
							class: 'border mt-4',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Show Overlay`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}