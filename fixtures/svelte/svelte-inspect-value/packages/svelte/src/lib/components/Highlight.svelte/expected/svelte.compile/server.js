import * as $ from 'svelte/internal/server';
import { useSearchContext } from '../contexts.js';
import { useOptions } from '../options.svelte.js';
import memoize from 'memoize';
import { highlightText } from '../util/highlight-text.js';

const hl = memoize(highlightText, {
	cacheKey: ([text, terms]) => text + terms.map((term) => term.value).join('')
});

export default function Highlight($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value: text,
			fields = ['any'],
			alsoMatch,
			class: className,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const searchCtx = useSearchContext();
		const options = useOptions();

		const $$d = $.derived(searchCtx),
			query = $.derived(() => $$d().query),
			matchingPaths = $.derived(() => $$d().matchingPaths),
			terms = $.derived(() => $$d().terms);

		const $$d_1 = $.derived(() => options.value),
			highlightMatches = $.derived(() => $$d_1().highlightMatches),
			search = $.derived(() => $$d_1().search);

		let chunks = $.derived(() => {
			if (terms().length && highlightMatches() && search()) {
				try {
					return hl(text, terms().filter((term) => term.value.length > 1 && (fields.includes(term.field) || term.field === 'any')));
				} catch(e) {
					console.error(e);

					return [];
				}
			}

			return [];
		});

		let altMatch = $.derived(() => {
			const term = terms()[0];

			if (matchingPaths().length > 0) return false;

			if (highlightMatches() && search() && term && alsoMatch != null && term.value.length > 1) {
				if (term.field !== 'any' && fields.length && !fields.includes(term.field)) return false;

				const fullMatch = alsoMatch.toLowerCase() === term.value.toLowerCase();

				if (term.exact) {
					return fullMatch ? 'full' : false;
				}

				const partialMatch = alsoMatch.toLowerCase().includes(term.value.toLowerCase());

				return fullMatch ? 'full' : partialMatch ? 'partial' : false;
			}

			return false;
		});

		if (highlightMatches() && query().length > 1 && chunks().some((c) => c.match)) {
			$$renderer.push(`<!--[0--><span${$.attributes({ 'aria-label': text, class: $.clsx(className), ...rest }, 'svelte-1ejafjm')}><!--[-->`);

			const each_array = $.ensure_array_like(chunks());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let chunk = each_array[$$index];

				$.element(
					$$renderer,
					chunk.match ? 'mark' : 'span',
					() => {
						$$renderer.push(` aria-hidden="true"${$.attr_class($.clsx(['can-match', chunk.match && 'highlight chunk']), 'svelte-1ejafjm')}`);
					},
					() => {
						$$renderer.push(`${$.escape(chunk.text)}`);
					}
				);
			}

			$$renderer.push(`<!--]--></span>`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attributes(
				{
					class: $.clsx([
						'can-match',
						altMatch() === 'partial' && 'highlight alt-soft',
						altMatch() === 'full' && 'highlight alt-full',
						className
					]),
					...rest
				},
				'svelte-1ejafjm'
			)}>${$.escape(text)}</span>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}