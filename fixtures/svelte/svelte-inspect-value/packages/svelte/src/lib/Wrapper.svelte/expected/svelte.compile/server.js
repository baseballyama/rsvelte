import * as $ from 'svelte/internal/server';
import { getContext, onDestroy, setContext } from 'svelte';
import { scope } from './attachments/focus.js';
import * as i from './components/icons/index.js';
import NodeActionButton from './components/NodeActionButton.svelte';
import NodeIconButton from './components/NodeIconButton.svelte';
import Search from './components/Search.svelte';
import { setAddDestroyCallback, setSearchContext } from './contexts.js';
import { useOptions } from './options.svelte.js';
import { useState } from './state.svelte.js';
import { fly, slide } from './transition/index.js';
import { createTypingBufferContext } from './typingbuffer.svelte.js';
import { wait } from './util.js';
import { clearSearchCache, parseSearchTerms } from './util/search.js';
import { tinykeys } from './util/hotkeys.js';

export default function Wrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);

		let {
			onlog,
			oninspectvaluechange,
			showExpandCollapse = false,
			headingExtra,
			onhandleclick,
			heading,
			children,
			class: classValue,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const inFixed = getContext(Symbol.for('siv.fixed'));
		const collapseState = useState();
		const options = useOptions();
		const destroyCallbacks = [];
		const typingBuffer = createTypingBufferContext(id);

		let $$d = $.derived(() => options.value),
			search = $.derived(() => $$d().search),
			animRate = $.derived(() => $$d().animRate);

		let collapsed = false;
		let searchInput = '';
		let matchingPaths = [];
		let terms = $.derived(() => search() && searchInput.length ? parseSearchTerms(searchInput) : []);
		let wrapperEle = void 0;
		let searchEle = void 0;
		let lastFocusedEle = void 0;
		let settingCollapse = false;

		setSearchContext(() => ({
			searching: searchInput.length > 1,
			matchingPaths,
			query: searchInput,
			terms: terms()
		}));

		setContext(Symbol.for('siv.focus-id'), id);

		setAddDestroyCallback((cb) => {
			destroyCallbacks.push(cb);
		});

		function activeElementInWrapper() {
			return wrapperEle?.contains(document.activeElement);
		}

		// set up hotkeys
		onDestroy(() => {
			for (const callback of destroyCallbacks) {
				callback();
			}
		});

		function onSearchKeyDown(event) {
			if (event.key === 'Escape' && lastFocusedEle != null) {
				lastFocusedEle.focus();
				lastFocusedEle = null;
			}
		}

		function searchWithQuery(queryText) {
			searchInput = queryText;
			searchEle?.search();
		}

		let hasExpandedTopLevel = $.derived(() => {
			if (!showExpandCollapse) return false;
			if (settingCollapse) return true;

			const paths = Object.entries(collapseState.value).map((e) => e[0]);

			for (const p of paths) {
				if (p.split('.').length === 1 && collapseState.value[p].collapsed === false) {
					return true;
				}
			}

			return false;
		});

		async function setCollapse(collapsed) {
			if (!settingCollapse) {
				settingCollapse = collapsed ? 'collapsing' : 'expanding';

				const paths = Object.entries(collapseState.value).map((e) => e[0]);

				for (const p of collapsed ? paths.toReversed() : paths) {
					if (p.split('.').length === 1) {
						if (collapseState.value[p]?.collapsed !== collapsed) {
							collapseState.setCollapse(p, { collapsed });
							await wait(); // avoid forced reflow (and get nice stagger effect)
						}
					}
				}

				settingCollapse = false;
			}
		}

		// FIXME: only works for currently visible values but is the "cheapest" cache bust strat for now
		function onNestedValueChange() {
			clearSearchCache();
			searchEle?.clearPrevQuery();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attributes(
				{
					class: $.clsx(['svelte-inspect-value', inFixed && 'in-fixed', classValue]),
					'data-focus-id': id,
					...rest
				},
				'svelte-nn2nwk',
				void 0,
				{ '--transition-rate': animRate() }
			)}>`);

			if (heading || search()) {
				$$renderer.push(`<!--[0--><div${$.attr_class('heading svelte-nn2nwk', void 0, { 'collapsed': collapsed })}><button class="heading-collapse-button svelte-nn2nwk"><div class="collapse svelte-nn2nwk">`);

				if (i.Caret) {
					$$renderer.push('<!--[-->');

					i.Caret($$renderer, {
						style: `rotate: ${$.stringify(collapsed ? 0 : 90)}deg; transition: rotate var(--__transition-duration) var(--_back-out)`
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div> `);

				if (typeof heading === 'string') {
					$$renderer.push(`<!--[0--><span class="heading-text svelte-nn2nwk">${$.escape(heading)}</span>`);
				} else if (typeof heading === 'function') {
					$$renderer.push('<!--[1-->');
					heading($$renderer, collapsed);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></button> <div class="heading-extra svelte-nn2nwk">`);

				if (search() && !collapsed) {
					$$renderer.push('<!--[0-->');

					Search($$renderer, {
						onkeydown: onSearchKeyDown,
						get matchingPaths() {
							return matchingPaths;
						},

						set matchingPaths($$value) {
							matchingPaths = $$value;
							$$settled = false;
						},

						get query() {
							return searchInput;
						},

						set query($$value) {
							searchInput = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (showExpandCollapse && !collapsed) {
					$$renderer.push('<!--[0-->');

					NodeIconButton($$renderer, {
						title: `${hasExpandedTopLevel() ? 'collapse' : 'expand'} all`,
						onclick: () => setCollapse(hasExpandedTopLevel()),
						disabled: settingCollapse !== false,
						children: ($$renderer) => {
							if (i.ExpandCollapse) {
								$$renderer.push('<!--[-->');
								i.ExpandCollapse($$renderer, { expand: !hasExpandedTopLevel(), setting: settingCollapse });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					NodeIconButton($$renderer, {
						onclick: onlog,
						children: ($$renderer) => {
							if (i.Console) {
								$$renderer.push('<!--[-->');
								i.Console($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);
				headingExtra?.($$renderer);
				$$renderer.push(`<!----></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!collapsed) {
				$$renderer.push('<!--[0-->');

				if (typingBuffer.current.length) {
					$$renderer.push(`<!--[0--><div class="typebuffer svelte-nn2nwk"><div style="height: 1em; width: 1em; flex-shrink: 0" class="svelte-nn2nwk">`);

					if (i.Search) {
						$$renderer.push('<!--[-->');
						i.Search($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> <div style="display: flex" class="svelte-nn2nwk"><!--[-->`);

					const each_array = $.ensure_array_like(typingBuffer.current);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let c = each_array[i];

						$$renderer.push(`<div style="color: var(--_text-color); width: 1ch;" class="svelte-nn2nwk">${$.escape(c)}</div>`);
					}

					$$renderer.push(`<!--]--><!---->`);

					{
						$$renderer.push(`<span class="block svelte-nn2nwk">▊</span>`);
					}

					$$renderer.push(`<!----></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="body svelte-nn2nwk">`);

				{
					function failed($$renderer, _, reset) {
						$$renderer.push(`<!---->root error (see console) `);

						NodeActionButton($$renderer, {
							onclick: reset,
							children: ($$renderer) => {
								$$renderer.push(`<!---->reset`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					}

					$$renderer.boundary({ failed }, ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						{
							children($$renderer);
							$$renderer.push(`<!---->`);
						}

						$$renderer.push(`<!--]-->`);
					});
				}

				$$renderer.push(`</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { searchWithQuery });
	});
}