import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, onDestroy } from 'svelte';
import * as icons from './icons/index.js';
import { useOptions } from '../options.svelte.js';
import { useState } from '../state.svelte.js';
import { wait } from '../util.js';
import { getAncestorPaths, searchStructuredIndex } from '../util/search.js';
import Input from './Input.svelte';
import NodeIconButton from './NodeIconButton.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'query',
	'matchingPaths',
	'onkeydown'
]);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Search($$anchor, $$props) {
	const // svelte-ignore state_referenced_locally
	id = $.props_id();

	$.push($$props, true);

	let query = $.prop($$props, 'query', 15, ''),
		matchingPaths = $.prop($$props, 'matchingPaths', 31, () => $.proxy([])),
		rest = $.rest_props($$props, rest_excludes);

	const collapseState = useState();
	const options = useOptions();

	const $$d = $.derived(() => options.value),
		initialMode = $.derived(() => $.get($$d).searchMode),
		searchKind = $.derived(() => $.get($$d).search);

	let searchEle = $.state(void 0);
	let prevQuery = $.state(void 0);
	let mode = $.state($.proxy($.get(initialMode)));

	$.user_effect(() => {
		if (query().length === 0 || $.get(searchKind) === false) {
			matchingPaths([]);
		}
	});

	const buildIndex = getContext(Symbol.for('siv.build-index'));

	async function expandMatchingPaths() {
		for (const path of matchingPaths()) {
			collapseState.setCollapse(path, { collapsed: false });
			await wait();
		}
	}

	function searchWithQuery(queryText) {
		query(queryText);
		search();
	}

	function search() {
		if (query().length) {
			if ($.get(prevQuery) === query() && matchingPaths().length > 0 && matchingPaths().length > 0) {
				expandMatchingPaths();
				$.set(prevQuery, undefined);

				return;
			}

			$.set(prevQuery, query(), true);

			const sIndex = buildIndex?.();

			if (sIndex) {
				const hits = searchStructuredIndex(sIndex, query(), $.get(mode));

				if (hits.length) {
					let precedingPaths = new Set();

					hits.forEach((p) => {
						getAncestorPaths(p).forEach((path) => precedingPaths.add(path));
					});

					matchingPaths([...precedingPaths, ...hits].sort((a, b) => a.length - b.length));
				} else {
					matchingPaths([]);
				}
			}
		} else {
			matchingPaths([]);
			$.set(prevQuery, undefined);
		}
	}

	function onSearchKeyDown(event) {
		if (event.key === 'Enter') {
			search();
		} else if (event.key === 'Escape') {
			matchingPaths([]);
			$.set(prevQuery, undefined);
		}

		$$props.onkeydown?.(event);
	}

	async function focus() {
		$.get(searchEle)?.focus();
	}

	onDestroy(() => {
		matchingPaths([]);
	});

	function clearPrevQuery() {
		$.set(prevQuery, undefined);
	}

	var $$exports = { searchWithQuery, search, focus, clearPrevQuery };

	{
		const icon = ($$anchor) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					NodeIconButton($$anchor, {
						title: 'clear search',
						onclick: () => {
							query('');
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							$.component(node_1, () => icons.Close, ($$anchor, icons_Close) => {
								icons_Close($$anchor, {});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				};

				$.if(node, ($$render) => {
					if (matchingPaths().length > 0) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node, 2);

			{
				var consequent_1 = ($$anchor) => {
					{
						let $0 = $.derived(() => $.get(mode) === 'and'
							? 'AND — node must match all terms'
							: 'OR — node must match one of the terms');

						NodeIconButton($$anchor, {
							'data-testid': 'search-mode-btn',
							style: 'min-width: 1ch; overflow: hidden;',
							get title() {
								return $.get($0);
							},

							onclick: () => {
								if ($.get(mode) === 'and') {
									$.set(mode, 'or');
								} else {
									$.set(mode, 'and');
								}
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_5 = $.comment();
								var node_3 = $.first_child(fragment_5);

								$.component(node_3, () => icons.AndOr, ($$anchor, icons_AndOr) => {
									icons_AndOr($$anchor, {
										get mode() {
											return $.get(mode);
										}
									});
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					}
				};

				var d = $.derived(() => query().split(' ').filter(Boolean).length > 1);

				$.if(node_2, ($$render) => {
					if ($.get(d)) $$render(consequent_1);
				});
			}

			var node_4 = $.sibling(node_2, 2);

			{
				let $0 = $.derived(() => query().length === 0);

				NodeIconButton(node_4, {
					onclick: search,
					get disabled() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_6 = $.comment();
						var node_5 = $.first_child(fragment_6);

						$.component(node_5, () => icons.Search, ($$anchor, icons_Search) => {
							icons_Search($$anchor, {});
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => $.get(prevQuery) ?? 'search');

		$.bind_this(
			Input($$anchor, $.spread_props(
				{
					get id() {
						return id;
					},
					type: 'search',
					transitionParams: { axis: 'x' },
					onkeydown: onSearchKeyDown,
					get placeholder() {
						return $.get($0);
					},
					style: 'padding-right: 0; font-size: 0.857em'
				},
				() => rest,
				{
					get value() {
						return query();
					},

					set value($$value) {
						query($$value);
					},
					icon,
					$$slots: { icon: true }
				}
			)),
			($$value) => $.set(searchEle, $$value, true),
			() => $.get(searchEle)
		);
	}

	return $.pop($$exports);
}