import * as $ from 'svelte/internal/server';
import { getSettings } from 'layerchart';

import {
	Button,
	Menu,
	Switch,
	Toggle,
	ToggleGroup,
	ToggleOption,
	Tooltip
} from 'svelte-ux';

import { toTitleCase } from '@layerstack/utils';
import { LoadingPlaceholder } from '@layerstack/docs/components';
import OpenWithButton from '$lib/components/OpenWithButton.svelte';
import { examples } from '@layerstack/docs/context';
import { intersectExampleLayers } from '$lib/utils/layers.js';
import { page } from '$app/state';
import LucideSettings from '~icons/lucide/settings';
import LucideChevronLeft from '~icons/lucide/chevron-left';
import LucideChevronRight from '~icons/lucide/chevron-right';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// TODO: `setSettings({...})` or just use default?
		const settings = getSettings();

		let { data, children } = $$props;
		const metadata = $.derived(() => data.metadata);

		// Derive examples reactively so changes propagate to child components
		const currentExamples = $.derived(() => {
			const base = data.examples ?? {};

			// If there's an example from page data (for individual example pages), merge it in
			if (page.data.example && page.params.name && page.params.example) {
				const componentName = page.params.name;
				const exampleName = page.params.example;

				return {
					...base,
					[componentName]: { ...base[componentName], [exampleName]: page.data.example }
				};
			}

			// If there are examples from page data (for /examples page), merge them in
			if (page.data.examples) {
				const pageExamples = page.data.examples;

				// Deep merge the examples
				const merged = { ...base };

				for (const [comp, exs] of Object.entries(pageExamples)) {
					merged[comp] = { ...merged[comp], ...exs };
				}

				return merged;
			}

			return base;
		});

		// Add examples to context for Example component to use
		// Use getter to ensure child components get reactive access
		const examplesContext = {
			get current() {
				return currentExamples();
			}
		};

		examples.set(examplesContext);

		// Determine available layers from per-example (<script module>) or component metadata (markdown frontmatter)
		const pageExample = $.derived(() => {
			const { name, example } = page.params;

			return name && example ? currentExamples()[name]?.[example] : null;
		});

		// For example pages, intersect the supported layers of every component used.
		// A Spline in an otherwise Html-capable example narrows the toggle to [svg, canvas].
		const computedExampleLayers = $.derived(() => {
			const exampleInfo = page.params.example
				? data.catalog?.examples.find((e) => e.name === page.params.example)
				: undefined;

			return exampleInfo
				? intersectExampleLayers(exampleInfo.components, metadata().layers ?? [])
				: null;
		});

		let layers = $.derived(() => pageExample()?.module?.layers ?? computedExampleLayers() ?? metadata().layers ?? []);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="mb-4">`);

			if (page.params.example || page.route.id == '/docs/components/[name]/examples') {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					size: 'sm',
					icon: LucideChevronLeft,
					href: `/docs/components/${$.stringify(page.params.name)}`,
					class: 'mb-4 border',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Back to ${$.escape(page.params.name)}`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="flex items-center gap-2 text-xs font-bold"><div class="text-surface-content/50 capitalize">${$.escape(metadata().category)}</div> `);

			if (page.params.example) {
				$$renderer.push('<!--[0-->');
				LucideChevronRight($$renderer, { class: 'text-sm opacity-25' });
				$$renderer.push(`<!----> <a${$.attr('href', `/docs/components/${$.stringify(page.params.name)}`)} class="text-primary">${$.escape(metadata().name)}</a>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="flex items-center gap-4"><h1 class="text-3xl font-bold first-letter:capitalize">${$.escape(pageExample()?.module?.title ?? page.params.example?.replaceAll('-', ' ') ?? metadata().name)}</h1> <span class="flex items-center gap-1">`);

			if (layers()?.length) {
				$$renderer.push('<!--[0-->');

				ToggleGroup($$renderer, {
					variant: 'outline',
					color: 'primary',
					inset: true,
					rounded: 'full',
					size: 'sm',
					get value() {
						return settings.layer;
					},

					set value($$value) {
						settings.layer = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(layers());

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let layer = each_array[$$index];

							ToggleOption($$renderer, {
								value: layer,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(toTitleCase(layer))}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: open, toggle, toggleOff }) => {
						Tooltip($$renderer, {
							title: 'Settings',
							children: ($$renderer) => {
								Button($$renderer, {
									iconOnly: true,
									children: ($$renderer) => {
										LucideSettings($$renderer, { class: 'text-surface-content' });
										$$renderer.push(`<!----> `);

										Menu($$renderer, {
											open,
											placement: 'bottom-start',
											classes: { menu: 'p-2' },
											children: ($$renderer) => {
												$$renderer.push(`<label class="flex items-center gap-2"><span class="text-sm text-surface-content">Debug</span> `);

												Switch($$renderer, {
													get checked() {
														return settings.debug;
													},

													set checked($$value) {
														settings.debug = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----></label>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					}
				}
			});

			$$renderer.push(`<!----></span></div> `);

			if (pageExample()?.module?.description) {
				$$renderer.push(`<!--[0--><div class="text-sm text-surface-content/70">${$.escape(pageExample().module.description)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (page.params.example == null) {
				$$renderer.push(`<!--[0--><div class="text-sm text-surface-content/70">${$.escape(metadata().description)}</div> <div class="flex gap-2 mt-3">`);
				OpenWithButton($$renderer, { metadata: metadata() });
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);
			$$renderer.push(`<!--[!-->`);

			{
				LoadingPlaceholder($$renderer, {});
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}