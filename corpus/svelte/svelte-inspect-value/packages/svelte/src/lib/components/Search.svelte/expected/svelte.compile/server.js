import * as $ from 'svelte/internal/server';
import { getContext, onDestroy } from 'svelte';
import * as icons from './icons/index.js';
import { useOptions } from '../options.svelte.js';
import { useState } from '../state.svelte.js';
import { wait } from '../util.js';
import { getAncestorPaths, searchStructuredIndex } from '../util/search.js';
import Input from './Input.svelte';
import NodeIconButton from './NodeIconButton.svelte';

export default function Search($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const // svelte-ignore state_referenced_locally
		id = $.props_id($$renderer);

		let {
			query = '',
			matchingPaths = [],
			onkeydown,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const collapseState = useState();
		const options = useOptions();

		const $$d = $.derived(() => options.value),
			initialMode = $.derived(() => $$d().searchMode),
			searchKind = $.derived(() => $$d().search);

		let searchEle = void 0;
		let prevQuery = void 0;
		let mode = initialMode();
		const buildIndex = getContext(Symbol.for('siv.build-index'));

		async function expandMatchingPaths() {
			for (const path of matchingPaths) {
				collapseState.setCollapse(path, { collapsed: false });
				await wait();
			}
		}

		function searchWithQuery(queryText) {
			query = queryText;
			search();
		}

		function search() {
			if (query.length) {
				if (prevQuery === query && matchingPaths.length > 0 && matchingPaths.length > 0) {
					expandMatchingPaths();
					prevQuery = undefined;

					return;
				}

				prevQuery = query;

				const sIndex = buildIndex?.();

				if (sIndex) {
					const hits = searchStructuredIndex(sIndex, query, mode);

					if (hits.length) {
						let precedingPaths = new Set();

						hits.forEach((p) => {
							getAncestorPaths(p).forEach((path) => precedingPaths.add(path));
						});

						matchingPaths = [...precedingPaths, ...hits].sort((a, b) => a.length - b.length);
					} else {
						matchingPaths = [];
					}
				}
			} else {
				matchingPaths = [];
				prevQuery = undefined;
			}
		}

		function onSearchKeyDown(event) {
			if (event.key === 'Enter') {
				search();
			} else if (event.key === 'Escape') {
				matchingPaths = [];
				prevQuery = undefined;
			}

			onkeydown?.(event);
		}

		async function focus() {
			searchEle?.focus();
		}

		onDestroy(() => {
			matchingPaths = [];
		});

		function clearPrevQuery() {
			prevQuery = undefined;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function icon($$renderer) {
					if (matchingPaths.length > 0) {
						$$renderer.push('<!--[0-->');

						NodeIconButton($$renderer, {
							title: 'clear search',
							onclick: () => {
								query = '';
							},

							children: ($$renderer) => {
								if (icons.Close) {
									$$renderer.push('<!--[-->');
									icons.Close($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (query.split(' ').filter(Boolean).length > 1) {
						$$renderer.push('<!--[0-->');

						NodeIconButton($$renderer, {
							'data-testid': 'search-mode-btn',
							style: 'min-width: 1ch; overflow: hidden;',
							title: mode === 'and'
								? 'AND — node must match all terms'
								: 'OR — node must match one of the terms',

							onclick: () => {
								if (mode === 'and') {
									mode = 'or';
								} else {
									mode = 'and';
								}
							},

							children: ($$renderer) => {
								if (icons.AndOr) {
									$$renderer.push('<!--[-->');
									icons.AndOr($$renderer, { mode });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					NodeIconButton($$renderer, {
						onclick: search,
						disabled: query.length === 0,
						children: ($$renderer) => {
							if (icons.Search) {
								$$renderer.push('<!--[-->');
								icons.Search($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}

				Input($$renderer, $.spread_props([
					{
						id,
						type: 'search',
						transitionParams: { axis: 'x' },
						onkeydown: onSearchKeyDown,
						placeholder: prevQuery ?? 'search',
						style: 'padding-right: 0; font-size: 0.857em'
					},
					rest,
					{
						get value() {
							return query;
						},

						set value($$value) {
							query = $$value;
							$$settled = false;
						},
						icon,
						$$slots: { icon: true }
					}
				]));
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		$.bind_props($$props, {
			query,
			matchingPaths,
			searchWithQuery,
			search,
			focus,
			clearPrevQuery
		});
	});
}