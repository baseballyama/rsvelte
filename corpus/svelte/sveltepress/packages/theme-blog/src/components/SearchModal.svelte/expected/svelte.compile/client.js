import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { withBase } from '../search-url.js';

var root = $.from_html(`<li><a class="svelte-ma488q"><strong class="svelte-ma488q"> </strong>  <p class="svelte-ma488q"></p></a></li>`);
var root_1 = $.from_html(`<ul class="sp-search__results svelte-ma488q"></ul>`);
var root_2 = $.from_html(`<p class="sp-search__empty svelte-ma488q">Search unavailable.</p>`);
var root_3 = $.from_html(`<p class="sp-search__empty svelte-ma488q">No results.</p>`);
var root_4 = $.from_html(`<button type="button" class="sp-search-backdrop svelte-ma488q" aria-label="Close search"></button> <div class="sp-search svelte-ma488q" role="dialog" aria-modal="true" aria-label="Search"><input class="sp-search__input svelte-ma488q"/> <!></div>`, 1);

export default function SearchModal($$anchor, $$props) {
	$.push($$props, true);

	let query = $.state('');
	let results = $.state($.proxy([]));
	let selected = $.state(0);
	let pagefind = null;
	let loading = $.state(false);
	let loadError = $.state(false);
	let input = $.state(void 0);
	let timer;

	async function ensureLoaded() {
		if (pagefind) return;

		$.set(loading, true);

		try {
			// Pagefind runtime sits at {base}/pagefind/ after build. Build the URL
			// at runtime so Rollup cannot try to resolve it at build time.
			const url = `${window.location.origin}${base}/pagefind/pagefind.js`;

			// @ts-expect-error — runtime virtual import
			pagefind = await import(/* @vite-ignore */ url);

			await pagefind.init();
			$.set(loadError, false);
		} catch(err) {
			console.warn('[sveltepress] Pagefind runtime failed to load:', err);
			pagefind = null;
			$.set(loadError, true);
		} finally {
			$.set(loading, false);
		}
	}

	// When the modal opens: load Pagefind, focus input, remember the opener
	// so we can restore focus on close.
	$.user_effect(() => {
		if (!$$props.open) return;

		ensureLoaded();

		const opener = document.activeElement;

		// Focus after mount
		queueMicrotask(() => $.get(input)?.focus());

		return () => {
			opener?.focus();
		};
	});

	// Reset transient search state whenever the modal closes. Without this a
	// fast-typed search followed by Esc would fire runSearch against a closed
	// modal, and the next open would flash stale results.
	$.user_effect(() => {
		if ($$props.open) return;

		clearTimeout(timer);
		timer = undefined;
		$.set(query, '');
		$.set(results, [], true);
		$.set(selected, 0);
	});

	async function runSearch(q) {
		if (!pagefind || !q) {
			$.set(results, [], true);

			return;
		}

		const search = await pagefind.search(q);
		const top = await Promise.all(search.results.slice(0, 10).map((r) => r.data()));

		$.set(results, top.map(({ url, meta, excerpt }) => ({ url, meta, excerpt })), true);
		$.set(selected, 0);
	}

	function onInput(e) {
		$.set(query, e.target.value, true);
		clearTimeout(timer);
		timer = setTimeout(() => runSearch($.get(query)), 200);
	}

	function onKeydown(e) {
		if (e.key === 'Escape') {
			$$props.onClose();
		} else if (e.key === 'ArrowDown') {
			$.set(selected, Math.min($.get(results).length - 1, $.get(selected) + 1), true);
			e.preventDefault();
		} else if (e.key === 'ArrowUp') {
			$.set(selected, Math.max(0, $.get(selected) - 1), true);
			e.preventDefault();
		} else if (e.key === 'Enter' && $.get(results)[$.get(selected)]) {
			goto(withBase($.get(results)[$.get(selected)].url, base));
			$$props.onClose();
		} else if (e.key === 'Tab') {
			// Focus trap: the dialog has a single focusable control (the input).
			// Swallowing Tab keeps focus inside the aria-modal dialog.
			e.preventDefault();
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_1 = root_4();
			var button = $.first_child(fragment_1);
			var div = $.sibling(button, 2);
			var input_1 = $.child(div);

			$.remove_input_defaults(input_1);
			$.bind_this(input_1, ($$value) => $.set(input, $$value), () => $.get(input));

			var node_1 = $.sibling(input_1, 2);

			{
				var consequent = ($$anchor) => {
					var ul = root_1();

					$.each(ul, 21, () => $.get(results), $.index, ($$anchor, r, i) => {
						var li = root();
						let classes;
						var a = $.child(li);
						var strong = $.child(a);
						var text = $.only_child(strong, true);
						var p = $.sibling(strong, 2);

						$.html(p, () => $.get(r).excerpt, true);
						$.reset(p);
						$.reset(a);
						$.reset(li);

						$.template_effect(
							($0) => {
								classes = $.set_class(li, 1, 'sp-search__item svelte-ma488q', null, classes, { 'is-selected': i === $.get(selected) });
								$.set_attribute(a, 'href', $0);
								$.set_text(text, $.get(r).meta?.title ?? $.get(r).url);
							},
							[() => withBase($.get(r).url, base)]
						);

						$.event('mouseenter', li, () => $.set(selected, i, true));

						$.delegated('click', a, function (...$$args) {
							$$props.onClose?.apply(this, $$args);
						});

						$.append($$anchor, li);
					});

					$.reset(ul);
					$.append($$anchor, ul);
				};

				var consequent_1 = ($$anchor) => {
					var p_1 = root_2();

					$.append($$anchor, p_1);
				};

				var consequent_2 = ($$anchor) => {
					var p_2 = root_3();

					$.append($$anchor, p_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(results).length) $$render(consequent); else if ($.get(loadError) && !$.get(loading)) $$render(consequent_1, 1); else if ($.get(query) && !$.get(loading)) $$render(consequent_2, 2);
				});
			}

			$.reset(div);

			$.template_effect(() => {
				$.set_attribute(input_1, 'placeholder', $.get(loading) ? 'Loading…' : 'Search posts…');
				$.set_value(input_1, $.get(query));
			});

			$.delegated('click', button, function (...$$args) {
				$$props.onClose?.apply(this, $$args);
			});

			$.delegated('input', input_1, onInput);
			$.delegated('keydown', input_1, onKeydown);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.open) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'input', 'keydown']);