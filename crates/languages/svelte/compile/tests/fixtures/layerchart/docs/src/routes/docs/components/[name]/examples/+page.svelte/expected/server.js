import * as $ from 'svelte/internal/server';
import { useSearchParams } from 'runed/kit';
import { z } from 'zod';
import { TextField } from 'svelte-ux';
import LucideSearch from '~icons/lucide/search';
import Example from '$lib/components/Example.svelte';
import { H2 } from '@layerstack/docs/markdown/components';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let catalog = $.derived(() => data.catalog);
		const schema = z.object({ filter: z.string().nullable().default(null) });
		let params = useSearchParams(schema);

		let visibleExamples = $.derived(() => {
			if (!params.filter) {
				return catalog()?.examples ?? [];
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

			return (catalog()?.examples ?? []).filter((example) => matchesQuery(example.name));
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="mt-10">`);

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

			$$renderer.push(`<!----></div> `);

			const each_array = $.ensure_array_like(visibleExamples());

			if (each_array.length !== 0) {
				$$renderer.push('<!--[-->');

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let example = each_array[$$index];

					H2($$renderer, {
						class: 'first-letter:capitalize',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(example.name.replaceAll('-', ' '))}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Example($$renderer, { component: catalog().component, name: example.name });
					$$renderer.push(`<!---->`);
				}
			} else {
				$$renderer.push(`<!--[!--><p>No examples ${$.escape(params.filter ? 'match your filter' : 'available for this component')}.</p>`);
			}

			$$renderer.push(`<!--]-->`);
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