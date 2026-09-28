import * as $ from 'svelte/internal/server';
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

function scrollingValue($$renderer, value) {
	ScrollingValue($$renderer, { value, class: 'tabular-nums text-surface-content' });
}

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const stringParam = z.preprocess((val) => typeof val === 'boolean' ? String(val) : val, z.string().nullable().default(null));
		const schema = z.object({ filter: stringParam, category: stringParam });
		let params = useSearchParams(schema);
		let columnCount = typeof window !== 'undefined' && window.innerWidth > 800 ? 3 : 2;

		let visibleExamples = $.derived(() => {
			let filtered = data.components;

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

		let totalVisibleExamples = $.derived(() => sum(visibleExamples().map(({ examples }) => examples.length)) ?? 0);

		// Get unique categories from components
		let componentCategories = $.derived(() => {
			const categories = new Set();

			data.components.forEach(({ category }) => {
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
			...componentCategories().map((category) => ({
				label: category.charAt(0).toUpperCase() + category.slice(1),
				value: category,
				group: 'Categories'
			})),
			...data.components.map(({ component }) => ({ label: component, value: component, group: 'Components' }))
		]);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('xz3q8g', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Examples - LayerChart</title>`);
				});
			});

			H1($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Examples`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="text-sm text-surface-content/50 mb-10">Browse `);
			scrollingValue($$renderer, totalVisibleExamples());
			$$renderer.push(`<!----> examples across `);
			scrollingValue($$renderer, visibleExamples().length);
			$$renderer.push(`<!----> components</div> <div class="sticky top-42 sm:top-29 h-0"><div${$.attr_class($.clsx(cls('relative h-16 mask-b-from-50%', 'bg-radial from-black/0 from-[1px] to-surface-200/90 to-[1px] bg-size-[6px_6px] backdrop-blur-lg')))}></div></div> <div${$.attr_class($.clsx(cls('sticky top-16 grid grid-cols-1 sm:grid-cols-[1fr_200px_auto] items-center gap-3 py-2 z-1', 'bg-radial from-black/0 from-[1px] to-surface-200/90 to-[1px] bg-size-[6px_6px] backdrop-blur-lg')))}>`);

			{
				function prepend($$renderer) {
					LucideSearch($$renderer, { class: 'text-surface-content/50 mr-4' });
				}

				TextField($$renderer, {
					placeholder: 'Filter',
					clearable: true,
					get value() {
						return params.filter;
					},

					set value($$value) {
						params.filter = $$value;
						$$settled = false;
					},
					prepend,
					$$slots: { prepend: true }
				});
			}

			$$renderer.push(`<!----> <div class="flex gap-3 sm:contents">`);

			MenuField($$renderer, {
				options: categoryOptions(),
				class: 'flex-1',
				get value() {
					return params.category;
				},

				set value($$value) {
					params.category = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="flex gap-2">`);

			Button($$renderer, {
				icon: LucideZoomIn,
				variant: 'fill-outline',
				class: 'size-9 border-surface-content/30 pt-1',
				disabled: columnCount <= 1
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				icon: LucideZoomOut,
				variant: 'fill-outline',
				class: 'size-9 border-surface-content/30 pt-1',
				disabled: columnCount >= 5
			});

			$$renderer.push(`<!----></div></div></div> <div class="grid gap-10"><!--[-->`);

			const each_array = $.ensure_array_like(visibleExamples());

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let { component, examples } = each_array[$$index_1];

				$$renderer.push(`<div>`);

				H2($$renderer, {
					id: component,
					class: 'sticky top-42 sm:top-29 pt-2 pb-1',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(component)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="grid grid-cols-(--column-count) gap-4"${$.attr_style('', { '--column-count': `repeat(${$.stringify(columnCount)}, 1fr)` })}><!--[-->`);

				const each_array_1 = $.ensure_array_like(examples);

				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let example = each_array_1[$$index];

					ExampleLink($$renderer, { component, example: example.name, title: example.title });
				}

				$$renderer.push(`<!--]--></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { schema });
	});
}