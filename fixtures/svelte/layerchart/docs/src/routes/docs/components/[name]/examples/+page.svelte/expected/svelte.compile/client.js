import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useSearchParams } from 'runed/kit';
import { z } from 'zod';
import { TextField } from 'svelte-ux';
import LucideSearch from '~icons/lucide/search';
import Example from '$lib/components/Example.svelte';
import { H2 } from '@layerstack/docs/markdown/components';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p> </p>`);
var root_2 = $.from_html(`<div class="mt-10"><!></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let catalog = $.derived(() => $$props.data.catalog);
	const schema = z.object({ filter: z.string().nullable().default(null) });
	let params = useSearchParams(schema);

	let visibleExamples = $.derived(() => {
		if (!params.filter) {
			return $.get(catalog)?.examples ?? [];
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

		return ($.get(catalog)?.examples ?? []).filter((example) => matchesQuery(example.name));
	});

	var $$exports = { schema };
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		const prepend = ($$anchor) => {
			LucideSearch($$anchor, { class: 'text-surface-content/50 mr-4' });
		};

		TextField(node, {
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

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	$.each(
		node_1,
		17,
		() => $.get(visibleExamples),
		$.index,
		($$anchor, example) => {
			var fragment_2 = root();
			var node_2 = $.first_child(fragment_2);

			H2(node_2, {
				class: 'first-letter:capitalize',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					$.template_effect(($0) => $.set_text(text_1, $0), [() => $.get(example).name.replaceAll('-', ' ')]);
					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Example(node_3, {
				get component() {
					return $.get(catalog).component;
				},

				get name() {
					return $.get(example).name;
				}
			});

			$.append($$anchor, fragment_2);
		},
		($$anchor) => {
			var p = root_1();
			var text_2 = $.only_child(p);

			$.template_effect(() => $.set_text(text_2, `No examples ${params.filter ? 'match your filter' : 'available for this component'}.`));
			$.append($$anchor, p);
		}
	);

	$.append($$anchor, fragment);

	return $.pop($$exports);
}