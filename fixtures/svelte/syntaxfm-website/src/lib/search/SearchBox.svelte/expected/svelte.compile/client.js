import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { run } from 'svelte/legacy';
import { afterNavigate } from '$app/navigation';
import { overlay_open, search_query, search_recent, searching } from '$state/search';
import { onMount, tick } from 'svelte';
import SearchWorker from './search-worker.js?worker';
import SearchResults from './SearchResults.svelte';
import SearchResultList from './SearchResultList.svelte';
import { fade } from 'svelte/transition';
import { clickOutDialog } from '$actions/click_outside_dialog';

var root = $.from_html(`<div class="results-container svelte-j5iht5"><!></div>`);
var root_1 = $.from_html(`<button class="svelte-j5iht5"></button>`);
var root_2 = $.from_html(`<p>No recent searches</p>`);

var root_3 = $.from_html(`<div class="recent-searches svelte-j5iht5"><div><pre>
░██████╗██╗░░░██╗███╗░░██╗
██╔════╝╚██╗░██╔╝████╗░██║
╚█████╗░░╚████╔╝░██╔██╗██║
░╚═══██╗░░╚██╔╝░░██║╚████║
██████╔╝░░░██║░░░██║░╚███║
╚═════╝░░░░╚═╝░░░╚═╝░░╚══╝

████████╗░█████╗░██╗░░██╗
╚══██╔══╝██╔══██╗╚██╗██╔╝
░░░██║░░░███████║░╚███╔╝░
░░░██║░░░██╔══██║░██╔██╗░
░░░██║░░░██║░░██║██╔╝╚██╗
░░░╚═╝░░░╚═╝░░╚═╝╚═╝░░╚═╝
					</pre> <div class="color-boxes svelte-j5iht5"></div></div> <div><h2 id="search-header">Recent searches</h2> <!> <!></div></div>`);

var root_4 = $.from_html(`<dialog class="zone svelte-j5iht5" aria-labelledby="search-header"><section aria-label="Search Results Window"><header role="banner" class="svelte-j5iht5"><input placeholder="Search" aria-describedby="search-description" aria-label="Search" spellcheck="false" class="search-input svelte-j5iht5"/> <button class="close svelte-j5iht5" type="submit">×</button></header> <div class="results svelte-j5iht5"><!></div> <footer role="contentinfo" class="svelte-j5iht5"><p class="svelte-j5iht5">Search powered by vibes.</p></footer></section></dialog>`);

export default function SearchBox($$anchor, $$props) {
	$.push($$props, true);

	const $searching = () => $.store_get(searching, '$searching', $$stores);
	const $search_recent = () => $.store_get(search_recent, '$search_recent', $$stores);
	const $search_query = () => $.store_get(search_query, '$search_query', $$stores);
	const $overlay_open = () => $.store_get(overlay_open, '$overlay_open', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let search_input = $.state(null);
	let modal = $.state(null);
	let search = $.state(null);
	let recent_searches = $.state($.proxy([]));
	let worker = $.state(null);
	let ready = $.state(false);
	let active_color = $.state('var(--fg)');
	let uid = $.state(1);
	const pending = new Set();

	onMount(async () => {
		$.get(search_input).focus();
		$.set(worker, new SearchWorker(), true);

		$.get(worker).addEventListener('message', (event) => {
			const { type, payload } = event.data;

			if (type === 'ready') {
				$.set(ready, true);
			}

			if (type === 'results') {
				$.set(search, payload, true);
			}

			if (type === 'recents') {
				$.set(recent_searches, payload, true);
			}
		});

		$.get(worker).postMessage({ type: 'init', payload: { origin: location.origin } });
	});

	afterNavigate(() => {
		close();
	});

	async function close() {
		$.get(modal).close();

		if ($searching()) {
			$.store_set(searching, false);
		}

		$.set(search, null);
	}

	function navigate(href) {
		$.store_set(search_recent, [href, ...$search_recent().filter((x) => x !== href)]);
		close();
	}

	run(() => {
		if ($.get(ready)) {
			const id = $.update(uid);

			pending.add(id);
			$.get(worker).postMessage({ type: 'query', id, payload: $search_query() });
		}
	});

	run(() => {
		if ($.get(ready)) {
			$.get(worker).postMessage({ type: 'recents', payload: $.snapshot($search_recent()) });
		}
	});

	run(() => {
		tick().then(() => $.store_set(overlay_open, $searching()));
	});

	run(() => {
		if ($searching()) {
			if ($.get(modal)) {
				$.store_set(overlay_open, true);
				$.get(modal).showModal();
			}
		}
	});

	function change_color(e) {
		if (e.target instanceof Element) {
			let computed = window.getComputedStyle(e.target).backgroundColor;

			$.set(active_color, computed, true);
		}
	}

	function search_keydown(e) {
		if (e.key === 'Enter' && !e.isComposing) {
			const anchor = $.get(modal).querySelector('a[data-has-node]');

			if (anchor) {
				anchor.click();
			}
		}
	}

	var dialog = root_4();

	$.event('keydown', $.window, (e) => {
		if (e.key === 'k' && (navigator.platform === 'MacIntel' ? e.metaKey : e.ctrlKey)) {
			e.preventDefault();
			$.store_set(search_query, '');

			if ($searching()) {
				close();
			} else {
				$.store_set(searching, true);
			}
		}

		if (e.code === 'Escape') {
			close();
		}
	});

	$.set_style(dialog, '', {}, { '--bg': 'var(--bg-sheet)', '--fg': 'var(--fg-sheet)' });

	var section = $.child(dialog);
	var header = $.child(section);
	var input = $.child(header);

	$.remove_input_defaults(input);
	$.bind_this(input, ($$value) => $.set(search_input, $$value), () => $.get(search_input));

	var button = $.sibling(input, 2);

	$.reset(header);

	var div = $.sibling(header, 2);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			SearchResults(node_1, {
				get results() {
					return $.get(search).results;
				},

				get query() {
					return $.get(search).query;
				},

				$$events: {
					select: (e) => {
						close();
						navigate(e.detail.href);
					}
				}
			});

			$.reset(div_1);
			$.transition(3, div_1, () => fade, () => ({ duration: 300 }));
			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			var div_2 = root_3();
			var div_3 = $.child(div_2);
			var pre = $.child(div_3);
			let styles;
			var div_4 = $.sibling(pre, 2);

			$.each(div_4, 20, () => Array(12), $.index, ($$anchor, _, i) => {
				var button_1 = root_1();

				$.set_attribute(button_1, 'aria-label', `ASCII Color ${i + 1}`);
				$.delegated('click', button_1, change_color);
				$.append($$anchor, button_1);
			});

			$.reset(div_4);
			$.reset(div_3);

			var div_5 = $.sibling(div_3, 2);
			var h2 = $.child(div_5);
			let classes;
			var node_2 = $.sibling(h2, 2);

			{
				var consequent_1 = ($$anchor) => {
					var p = root_2();

					$.append($$anchor, p);
				};

				$.if(node_2, ($$render) => {
					if (!$.get(recent_searches).length) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					{
						let $0 = $.derived(() => $.get(search)?.query || '');

						SearchResultList($$anchor, {
							get results() {
								return $.get(recent_searches);
							},
							recent_searches: true,
							get query() {
								return $.get($0);
							},

							$$events: {
								select: (e) => {
									close();
									navigate(e.detail.href);
								}
							}
						});
					}
				};

				$.if(node_3, ($$render) => {
					if ($.get(recent_searches).length) $$render(consequent_2);
				});
			}

			$.reset(div_5);
			$.reset(div_2);

			$.template_effect(() => {
				styles = $.set_style(pre, 'overflow: hidden; width: 201px;', styles, { color: $.get(active_color) });
				classes = $.set_class(h2, 1, 'h5', null, classes, { empty: $.get(recent_searches).length === 0 });
			});

			$.transition(3, div_2, () => fade, () => ({ duration: 100 }));
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($.get(search)?.query) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.next(2);
	$.reset(section);
	$.reset(dialog);
	$.bind_this(dialog, ($$value) => $.set(modal, $$value), () => $.get(modal));
	$.action(dialog, ($$node) => clickOutDialog?.($$node));
	$.template_effect(() => $.set_value(input, $search_query()));
	$.event('click-outside', dialog, close);
	$.delegated('keydown', input, search_keydown);

	$.delegated('input', input, (e) => {
		$.store_set(search_query, e.currentTarget.value);
	});

	$.delegated('click', button, close);
	$.append($$anchor, dialog);
	$.pop();
	$$cleanup();
}

$.delegate(['keydown', 'input', 'click']);