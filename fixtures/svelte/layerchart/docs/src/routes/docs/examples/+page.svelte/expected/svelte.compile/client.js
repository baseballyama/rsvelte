import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, MenuField, ScrollingValue, TextField } from 'svelte-ux';
import { sum } from 'd3-array';
import { sortFunc } from '@layerstack/utils';
import { useSearchParams } from 'runed/kit';
import { z } from 'zod';
import { ExampleLink } from '@layerstack/docs/components';
import { H1, H2 } from '@layerstack/docs/markdown/components';
import LucideSearch from '~icons/lucide/search';
import LucideZoomIn from '~icons/lucide/zoom-in';
import LucideZoomOut from '~icons/lucide/zoom-out';
import { cls } from '@layerstack/tailwind';

const scrollingValue = ($$anchor, value = $.noop) => {
	ScrollingValue($$anchor, {
		get value() {
			return value();
		},
		class: 'tabular-nums text-surface-content'
	});
};

var root = $.from_html(`<div><!> <div class="grid grid-cols-(--column-count) gap-4"></div></div>`);
var root_1 = $.from_html(`<!> <div class="text-sm text-surface-content/50 mb-10">Browse <!> examples across <!> components</div> <div class="sticky top-42 sm:top-29 h-0"><div></div></div> <div><!> <div class="flex gap-3 sm:contents"><!> <div class="flex gap-2"><!> <!></div></div></div> <div class="grid gap-10"></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const stringParam = z.preprocess((val) => typeof val === 'boolean' ? String(val) : val, z.string().nullable().default(null));
	const schema = z.object({ filter: stringParam, category: stringParam });
	let params = useSearchParams(schema);
	let columnCount = $.state($.proxy(typeof window !== 'undefined' && window.innerWidth > 800 ? 3 : 2));

	let visibleExamples = $.derived(() => {
		let filtered = $$props.data.components;

		// Filter by selected category (component or category)
		if (params.category) {
			const selected = params.category.toLowerCase();

			filtered = filtered.filter(({ component, category }) => component === params.category || category?.toLowerCase() === selected);
		}

		// Filter by search query
		if (!params.filter) {
			return filtered;
		}

		const query = params.filter.toLowerCase().trim();

		// Split query into words
		const queryWords = query.split(/\s+/);

		// Helper function to split text by hyphens and underscores into words
		const getWords = (text) => text.toLowerCase().split(/[-_]/);

		// Helper function to check if all query words match
		const matchesQuery = (text) => {
			const textWords = getWords(text);

			// All query words must have a match in the text words
			return queryWords.every((queryWord) => textWords.some((textWord) => textWord.includes(queryWord)));
		};

		return filtered.map(({ component, category, examples }) => {
			// If component name matches, return all examples for this component
			if (matchesQuery(component)) {
				return { component, category, examples };
			}

			// Otherwise, filter examples by name
			const filteredExamples = examples.filter((example) => matchesQuery(example.name) || matchesQuery(example.title));

			// Only return component if it has matching examples
			if (filteredExamples.length > 0) {
				return { component, category, examples: filteredExamples };
			}

			return null;
		}).filter((item) => item !== null);
	});

	let totalVisibleExamples = $.derived(() => sum($.get(visibleExamples).map(({ examples }) => examples.length)) ?? 0);

	// Get unique categories from components
	let componentCategories = $.derived(() => {
		const categories = new Set();

		$$props.data.components.forEach(({ category }) => {
			if (category) {
				categories.add(category);
			}
		});

		return Array.from(categories).sort(sortFunc((category) => [
			'charts',
			'common',
			'primitives',
			'marks',
			'geo',
			'layout',
			'annotations',
			'interactions',
			'fill',
			'clipping',
			'layers',
			'other'
		].indexOf(category)));
	});

	let categoryOptions = $.derived(() => [
		{ label: 'All', value: null },
		...$.get(componentCategories).map((category) => ({
			label: category.charAt(0).toUpperCase() + category.slice(1),
			value: category,
			group: 'Categories'
		})),
		...$$props.data.components.map(({ component }) => ({ label: component, value: component, group: 'Components' }))
	]);

	var $$exports = { schema };
	var fragment_1 = root_1();

	$.head('xz3q8g', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Examples - LayerChart';
		});
	});

	var node = $.first_child(fragment_1);

	H1(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Examples');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.sibling($.child(div));

	scrollingValue(node_1, () => $.get(totalVisibleExamples));

	var node_2 = $.sibling(node_1, 2);

	scrollingValue(node_2, () => $.get(visibleExamples).length);
	$.next();
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var div_2 = $.only_child(div_1);
	var div_3 = $.sibling(div_1, 2);
	var node_3 = $.child(div_3);

	{
		const prepend = ($$anchor) => {
			LucideSearch($$anchor, { class: 'text-surface-content/50 mr-4' });
		};

		TextField(node_3, {
			placeholder: 'Filter',
			clearable: true,
			get value() {
				return params.filter;
			},

			set value($$value) {
				params.filter = $$value;
			},
			prepend,
			$$slots: { prepend: true }
		});
	}

	var div_4 = $.sibling(node_3, 2);
	var node_4 = $.child(div_4);

	MenuField(node_4, {
		get options() {
			return $.get(categoryOptions);
		},
		class: 'flex-1',
		get value() {
			return params.category;
		},

		set value($$value) {
			params.category = $$value;
		}
	});

	var div_5 = $.sibling(node_4, 2);
	var node_5 = $.child(div_5);

	{
		let $0 = $.derived(() => $.get(columnCount) <= 1);

		Button(node_5, {
			get icon() {
				return LucideZoomIn;
			},
			variant: 'fill-outline',
			class: 'size-9 border-surface-content/30 pt-1',
			get disabled() {
				return $.get($0);
			},

			$$events: {
				click: () => $.set(columnCount, Math.max(1, $.get(columnCount) - 1), true)
			}
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		let $0 = $.derived(() => $.get(columnCount) >= 5);

		Button(node_6, {
			get icon() {
				return LucideZoomOut;
			},
			variant: 'fill-outline',
			class: 'size-9 border-surface-content/30 pt-1',
			get disabled() {
				return $.get($0);
			},

			$$events: {
				click: () => $.set(columnCount, Math.min(5, $.get(columnCount) + 1), true)
			}
		});
	}

	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_3);

	var div_6 = $.sibling(div_3, 2);

	$.each(div_6, 21, () => $.get(visibleExamples), ({ component, examples }) => component, ($$anchor, $$item) => {
		let component = () => $.get($$item).component;
		let examples = () => $.get($$item).examples;
		var div_7 = root();
		var node_7 = $.child(div_7);

		H2(node_7, {
			get id() {
				return component();
			},
			class: 'sticky top-42 sm:top-29 pt-2 pb-1',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text();

				$.template_effect(() => $.set_text(text_2, component()));
				$.append($$anchor, text_2);
			},
			$$slots: { default: true }
		});

		var div_8 = $.sibling(node_7, 2);
		let styles;

		$.each(div_8, 21, examples, (example) => example.name, ($$anchor, example) => {
			ExampleLink($$anchor, {
				get component() {
					return component();
				},

				get example() {
					return $.get(example).name;
				},

				get title() {
					return $.get(example).title;
				}
			});
		});

		$.reset(div_8);
		$.reset(div_7);
		$.template_effect(() => styles = $.set_style(div_8, '', styles, { '--column-count': `repeat(${$.get(columnCount) ?? ''}, 1fr)` }));
		$.append($$anchor, div_7);
	});

	$.reset(div_6);

	$.template_effect(
		($0, $1) => {
			$.set_class(div_2, 1, $0);
			$.set_class(div_3, 1, $1);
		},
		[
			() => $.clsx(cls('relative h-16 mask-b-from-50%', 'bg-radial from-black/0 from-[1px] to-surface-200/90 to-[1px] bg-size-[6px_6px] backdrop-blur-lg')),
			() => $.clsx(cls('sticky top-16 grid grid-cols-1 sm:grid-cols-[1fr_200px_auto] items-center gap-3 py-2 z-1', 'bg-radial from-black/0 from-[1px] to-surface-200/90 to-[1px] bg-size-[6px_6px] backdrop-blur-lg'))
		]
	);

	$.append($$anchor, fragment_1);

	return $.pop($$exports);
}