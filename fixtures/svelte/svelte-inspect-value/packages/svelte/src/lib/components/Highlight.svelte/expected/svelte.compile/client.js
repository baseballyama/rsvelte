import 'svelte/internal/disclose-version';
import memoize from 'memoize';
import { highlightText } from '../util/highlight-text.js';
import * as $ from 'svelte/internal/client';
import { useSearchContext } from '../contexts.js';
import { useOptions } from '../options.svelte.js';

const hl = memoize(highlightText, {
	cacheKey: ([text, terms]) => text + terms.map((term) => term.value).join('')
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'fields',
	'alsoMatch',
	'class'
]);

var root = $.from_html(`<span></span>`);
var root_1 = $.from_html(`<span> </span>`);

export default function Highlight($$anchor, $$props) {
	$.push($$props, true);

	let fields = $.prop($$props, 'fields', 19, () => ['any']),
		rest = $.rest_props($$props, rest_excludes);

	const searchCtx = useSearchContext();
	const options = useOptions();

	const $$d = $.derived(searchCtx),
		query = $.derived(() => $.get($$d).query),
		matchingPaths = $.derived(() => $.get($$d).matchingPaths),
		terms = $.derived(() => $.get($$d).terms);

	const $$d_1 = $.derived(() => options.value),
		highlightMatches = $.derived(() => $.get($$d_1).highlightMatches),
		search = $.derived(() => $.get($$d_1).search);

	let chunks = $.derived(() => {
		if ($.get(terms).length && $.get(highlightMatches) && $.get(search)) {
			try {
				return hl($$props.value, $.get(terms).filter((term) => term.value.length > 1 && (fields().includes(term.field) || term.field === 'any')));
			} catch(e) {
				console.error(e);

				return [];
			}
		}

		return [];
	});

	let altMatch = $.derived(() => {
		const term = $.get(terms)[0];

		if ($.get(matchingPaths).length > 0) return false;

		if ($.get(highlightMatches) && $.get(search) && term && $$props.alsoMatch != null && term.value.length > 1) {
			if (term.field !== 'any' && fields().length && !fields().includes(term.field)) return false;

			const fullMatch = $$props.alsoMatch.toLowerCase() === term.value.toLowerCase();

			if (term.exact) {
				return fullMatch ? 'full' : false;
			}

			const partialMatch = $$props.alsoMatch.toLowerCase().includes(term.value.toLowerCase());

			return fullMatch ? 'full' : partialMatch ? 'partial' : false;
		}

		return false;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.attribute_effect(span, () => ({ 'aria-label': $$props.value, class: $$props.class, ...rest }), void 0, void 0, void 0, 'svelte-1ejafjm');

			$.each(span, 21, () => $.get(chunks), (chunk) => chunk.start, ($$anchor, chunk) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.element(node_1, () => $.get(chunk).match ? 'mark' : 'span', false, ($$element, $$anchor) => {
					$.attribute_effect(
						$$element,
						() => ({
							'aria-hidden': 'true',
							class: ['can-match', $.get(chunk).match && 'highlight chunk']
						}),
						void 0,
						void 0,
						void 0,
						'svelte-1ejafjm'
					);

					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, $.get(chunk).text));
					$.append($$anchor, text_1);
				});

				$.append($$anchor, fragment_1);
			});

			$.reset(span);
			$.append($$anchor, span);
		};

		var d = $.derived(() => $.get(highlightMatches) && $.get(query).length > 1 && $.get(chunks).some((c) => c.match));

		var alternate = ($$anchor) => {
			var span_1 = root_1();

			$.attribute_effect(
				span_1,
				() => ({
					class: [
						'can-match',
						$.get(altMatch) === 'partial' && 'highlight alt-soft',
						$.get(altMatch) === 'full' && 'highlight alt-full',
						$$props.class
					],
					...rest
				}),
				void 0,
				void 0,
				void 0,
				'svelte-1ejafjm'
			);

			var text_2 = $.only_child(span_1, true);

			$.template_effect(() => $.set_text(text_2, $$props.value));
			$.append($$anchor, span_1);
		};

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}