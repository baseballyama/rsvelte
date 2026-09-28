import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <a class="text-primary"> </a>`, 1);
var root_1 = $.from_html(`<label class="flex items-center gap-2"><span class="text-sm text-surface-content">Debug</span> <!></label>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="text-sm text-surface-content/70"> </div>`);
var root_4 = $.from_html(`<div class="text-sm text-surface-content/70"> </div> <div class="flex gap-2 mt-3"><!></div>`, 1);
var root_5 = $.from_html(`<div class="mb-4"><!> <div class="flex items-center gap-2 text-xs font-bold"><div class="text-surface-content/50 capitalize"> </div> <!></div> <div class="flex items-center gap-4"><h1 class="text-3xl font-bold first-letter:capitalize"> </h1> <span class="flex items-center gap-1"><!> <!></span></div> <!> <!></div> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	// TODO: `setSettings({...})` or just use default?
	const settings = getSettings();

	const metadata = $.derived(() => $$props.data.metadata);

	// Derive examples reactively so changes propagate to child components
	const currentExamples = $.derived(() => {
		const base = $$props.data.examples ?? {};

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
			return $.get(currentExamples);
		}
	};

	examples.set(examplesContext);

	// Determine available layers from per-example (<script module>) or component metadata (markdown frontmatter)
	const pageExample = $.derived(() => {
		const { name, example } = page.params;

		return name && example ? $.get(currentExamples)[name]?.[example] : null;
	});

	// For example pages, intersect the supported layers of every component used.
	// A Spline in an otherwise Html-capable example narrows the toggle to [svg, canvas].
	const computedExampleLayers = $.derived(() => {
		const exampleInfo = page.params.example
			? $$props.data.catalog?.examples.find((e) => e.name === page.params.example)
			: undefined;

		return exampleInfo
			? intersectExampleLayers(exampleInfo.components, $.get(metadata).layers ?? [])
			: null;
	});

	let layers = $.derived(() => $.get(pageExample)?.module?.layers ?? $.get(computedExampleLayers) ?? $.get(metadata).layers ?? []);
	var fragment = root_5();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, {
				size: 'sm',
				get icon() {
					return LucideChevronLeft;
				},

				get href() {
					return `/docs/components/${page.params.name ?? ''}`;
				},
				class: 'mb-4 border',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, `Back to ${page.params.name ?? ''}`));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (page.params.example || page.route.id == '/docs/components/[name]/examples') $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);
	var div_2 = $.child(div_1);
	var text_1 = $.only_child(div_2, true);
	var node_1 = $.sibling(div_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_3 = root();
			var node_2 = $.first_child(fragment_3);

			LucideChevronRight(node_2, { class: 'text-sm opacity-25' });

			var a = $.sibling(node_2, 2);
			var text_2 = $.only_child(a, true);

			$.template_effect(() => {
				$.set_attribute(a, 'href', `/docs/components/${page.params.name ?? ''}`);
				$.set_text(text_2, $.get(metadata).name);
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node_1, ($$render) => {
			if (page.params.example) $$render(consequent_1);
		});
	}

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var h1 = $.child(div_3);
	var text_3 = $.only_child(h1, true);
	var span = $.sibling(h1, 2);
	var node_3 = $.child(span);

	{
		var consequent_2 = ($$anchor) => {
			ToggleGroup($$anchor, {
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
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_5 = $.comment();
					var node_4 = $.first_child(fragment_5);

					$.each(node_4, 17, () => $.get(layers), $.index, ($$anchor, layer) => {
						ToggleOption($$anchor, {
							get value() {
								return $.get(layer);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text();

								$.template_effect(($0) => $.set_text(text_4, $0), [() => toTitleCase($.get(layer))]);
								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_3, ($$render) => {
			if ($.get(layers)?.length) $$render(consequent_2);
		});
	}

	var node_5 = $.sibling(node_3, 2);

	Toggle(node_5, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const open = $.derived(() => $$slotProps.on);
				const toggle = $.derived(() => $$slotProps.toggle);
				const toggleOff = $.derived(() => $$slotProps.toggleOff);

				Tooltip($$anchor, {
					title: 'Settings',
					children: ($$anchor, $$slotProps) => {
						Button($$anchor, {
							iconOnly: true,
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_10 = root_2();
								var node_6 = $.first_child(fragment_10);

								LucideSettings(node_6, { class: 'text-surface-content' });

								var node_7 = $.sibling(node_6, 2);

								Menu(node_7, {
									get open() {
										return $.get(open);
									},
									placement: 'bottom-start',
									classes: { menu: 'p-2' },
									$$events: {
										close: function (...$$args) {
											$.get(toggleOff)?.apply(this, $$args);
										}
									},

									children: ($$anchor, $$slotProps) => {
										var label = root_1();
										var node_8 = $.sibling($.child(label), 2);

										Switch(node_8, {
											get checked() {
												return settings.debug;
											},

											set checked($$value) {
												settings.debug = $$value;
											}
										});

										$.reset(label);
										$.append($$anchor, label);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_10);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}
		}
	});

	$.reset(span);
	$.reset(div_3);

	var node_9 = $.sibling(div_3, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_4 = root_3();
			var text_5 = $.only_child(div_4, true);

			$.template_effect(() => $.set_text(text_5, $.get(pageExample).module.description));
			$.append($$anchor, div_4);
		};

		$.if(node_9, ($$render) => {
			if ($.get(pageExample)?.module?.description) $$render(consequent_3);
		});
	}

	var node_10 = $.sibling(node_9, 2);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_11 = root_4();
			var div_5 = $.first_child(fragment_11);
			var text_6 = $.only_child(div_5, true);
			var div_6 = $.sibling(div_5, 2);
			var node_11 = $.child(div_6);

			OpenWithButton(node_11, {
				get metadata() {
					return $.get(metadata);
				}
			});

			$.reset(div_6);
			$.template_effect(() => $.set_text(text_6, $.get(metadata).description));
			$.append($$anchor, fragment_11);
		};

		$.if(node_10, ($$render) => {
			if (page.params.example == null) $$render(consequent_4);
		});
	}

	$.reset(div);

	var node_12 = $.sibling(div, 2);

	{
		const pending = ($$anchor) => {
			LoadingPlaceholder($$anchor, {});
		};

		$.boundary(node_12, { pending }, ($$anchor) => {
			var fragment_13 = $.comment();
			var node_13 = $.first_child(fragment_13);

			$.snippet(node_13, () => $$props.children);
			$.append($$anchor, fragment_13);
		});
	}

	$.template_effect(
		($0) => {
			$.set_text(text_1, $.get(metadata).category);
			$.set_text(text_3, $0);
		},
		[
			() => $.get(pageExample)?.module?.title ?? page.params.example?.replaceAll('-', ' ') ?? $.get(metadata).name
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}