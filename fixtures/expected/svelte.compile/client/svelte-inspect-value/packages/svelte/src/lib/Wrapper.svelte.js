import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'onlog',
	'oninspectvaluechange',
	'showExpandCollapse',
	'headingExtra',
	'onhandleclick',
	'heading',
	'children',
	'class'
]);

var root = $.from_html(`<span class="heading-text svelte-nn2nwk"> </span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div><button class="heading-collapse-button svelte-nn2nwk"><div class="collapse svelte-nn2nwk"><!></div> <!></button> <div class="heading-extra svelte-nn2nwk"><!> <!> <!></div></div>`);
var root_3 = $.from_html(`<div style="color: var(--_text-color); width: 1ch;" class="svelte-nn2nwk"> </div>`);
var root_4 = $.from_html(`<span class="block svelte-nn2nwk">▊</span>`);
var root_5 = $.from_html(`<div class="typebuffer svelte-nn2nwk"><div style="height: 1em; width: 1em; flex-shrink: 0" class="svelte-nn2nwk"><!></div> <div style="display: flex" class="svelte-nn2nwk"><!><!></div></div>`);
var root_6 = $.from_html(`root error (see console) <!>`, 1);
var root_7 = $.from_html(`<!> <div class="body svelte-nn2nwk"><!></div>`, 1);
var root_8 = $.from_html(`<div><!> <!></div>`);

export default function Wrapper($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	let showExpandCollapse = $.prop($$props, 'showExpandCollapse', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	const inFixed = getContext(Symbol.for('siv.fixed'));
	const collapseState = useState();
	const options = useOptions();
	const destroyCallbacks = [];
	const typingBuffer = createTypingBufferContext(id);

	let $$d = $.derived(() => options.value),
		search = $.derived(() => $.get($$d).search),
		animRate = $.derived(() => $.get($$d).animRate);

	let collapsed = $.state(false);
	let searchInput = $.state('');
	let matchingPaths = $.state($.proxy([]));
	let terms = $.derived(() => $.get(search) && $.get(searchInput).length ? parseSearchTerms($.get(searchInput)) : []);
	let wrapperEle = $.state(void 0);
	let searchEle = $.state(void 0);
	let lastFocusedEle = $.state(void 0);
	let settingCollapse = $.state(false);

	setSearchContext(() => ({
		searching: $.get(searchInput).length > 1,
		matchingPaths: $.get(matchingPaths),
		query: $.get(searchInput),
		terms: $.get(terms)
	}));

	setContext(Symbol.for('siv.focus-id'), id);

	setAddDestroyCallback((cb) => {
		destroyCallbacks.push(cb);
	});

	function activeElementInWrapper() {
		return $.get(wrapperEle)?.contains(document.activeElement);
	}

	// set up hotkeys
	$.user_effect(() => {
		const { hotkeys } = options;
		let unbinds = [];

		if (hotkeys) {
			if (hotkeys.expandTop) {
				unbinds.push(tinykeys(window, {
					[hotkeys.expandTop]: (event) => {
						if (!activeElementInWrapper()) return;

						event.preventDefault();
						setCollapse(false);
					}
				}));
			}

			if (hotkeys.collapseTop) {
				unbinds.push(tinykeys(window, {
					[hotkeys.collapseTop]: (event) => {
						if (!activeElementInWrapper()) return;

						event.preventDefault();
						setCollapse(true);
					}
				}));
			}

			if (hotkeys.search && $.get(search)) {
				unbinds.push(tinykeys(window, {
					[hotkeys.search]: (event) => {
						if (!activeElementInWrapper()) return;

						event.preventDefault();
						$.set(lastFocusedEle, document.activeElement, true);
						$.get(searchEle)?.focus();
					}
				}));
			}
		}

		return () => {
			unbinds.forEach((ub) => ub());
		};
	});

	onDestroy(() => {
		for (const callback of destroyCallbacks) {
			callback();
		}
	});

	function onSearchKeyDown(event) {
		if (event.key === 'Escape' && $.get(lastFocusedEle) != null) {
			$.get(lastFocusedEle).focus();
			$.set(lastFocusedEle, null);
		}
	}

	function searchWithQuery(queryText) {
		$.set(searchInput, queryText, true);
		$.get(searchEle)?.search();
	}

	let hasExpandedTopLevel = $.derived(() => {
		if (!showExpandCollapse()) return false;
		if ($.get(settingCollapse)) return true;

		const paths = Object.entries(collapseState.value).map((e) => e[0]);

		for (const p of paths) {
			if (p.split('.').length === 1 && collapseState.value[p].collapsed === false) {
				return true;
			}
		}

		return false;
	});

	async function setCollapse(collapsed) {
		if (!$.get(settingCollapse)) {
			$.set(settingCollapse, collapsed ? 'collapsing' : 'expanding', true);

			const paths = Object.entries(collapseState.value).map((e) => e[0]);

			for (const p of collapsed ? paths.toReversed() : paths) {
				if (p.split('.').length === 1) {
					if (collapseState.value[p]?.collapsed !== collapsed) {
						collapseState.setCollapse(p, { collapsed });
						await wait(); // avoid forced reflow (and get nice stagger effect)
					}
				}
			}

			$.set(settingCollapse, false);
		}
	}

	// FIXME: only works for currently visible values but is the "cheapest" cache bust strat for now
	function onNestedValueChange() {
		clearSearchCache();
		$.get(searchEle)?.clearPrevQuery();
	}

	var $$exports = { searchWithQuery };
	var div = root_8();

	$.attribute_effect(
		div,
		() => ({
			class: ['svelte-inspect-value', inFixed && 'in-fixed', $$props.class],
			oninspectvaluechange: onNestedValueChange,
			'data-focus-id': id,
			...rest,
			[$.STYLE]: { '--transition-rate': $.get(animRate) }
		}),
		void 0,
		void 0,
		void 0,
		'svelte-nn2nwk'
	);

	var node = $.child(div);

	{
		var consequent_4 = ($$anchor) => {
			var div_1 = root_2();
			let classes;
			var button = $.child(div_1);
			var div_2 = $.child(button);
			var node_1 = $.child(div_2);

			{
				let $0 = $.derived(() => $.get(collapsed) ? 0 : 90);

				$.component(node_1, () => i.Caret, ($$anchor, i_Caret) => {
					i_Caret($$anchor, {
						get style() {
							return `rotate: ${$.get($0) ?? ''}deg; transition: rotate var(--__transition-duration) var(--_back-out)`;
						}
					});
				});
			}

			$.reset(div_2);

			var node_2 = $.sibling(div_2, 2);

			{
				var consequent = ($$anchor) => {
					var span = root();
					var text = $.only_child(span, true);

					$.template_effect(() => $.set_text(text, $$props.heading));
					$.append($$anchor, span);
				};

				var consequent_1 = ($$anchor) => {
					var fragment = $.comment();
					var node_3 = $.first_child(fragment);

					$.snippet(node_3, () => $$props.heading, () => $.get(collapsed));
					$.append($$anchor, fragment);
				};

				$.if(node_2, ($$render) => {
					if (typeof $$props.heading === 'string') $$render(consequent); else if (typeof $$props.heading === 'function') $$render(consequent_1, 1);
				});
			}

			$.reset(button);

			var div_3 = $.sibling(button, 2);
			var node_4 = $.child(div_3);

			{
				var consequent_2 = ($$anchor) => {
					$.bind_this(
						Search($$anchor, {
							onkeydown: onSearchKeyDown,
							get matchingPaths() {
								return $.get(matchingPaths);
							},

							set matchingPaths($$value) {
								$.set(matchingPaths, $$value, true);
							},

							get query() {
								return $.get(searchInput);
							},

							set query($$value) {
								$.set(searchInput, $$value, true);
							}
						}),
						($$value) => $.set(searchEle, $$value, true),
						() => $.get(searchEle)
					);
				};

				$.if(node_4, ($$render) => {
					if ($.get(search) && !$.get(collapsed)) $$render(consequent_2);
				});
			}

			var node_5 = $.sibling(node_4, 2);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_2 = root_1();
					var node_6 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => $.get(hasExpandedTopLevel) ? 'collapse' : 'expand');
						let $1 = $.derived(() => $.get(settingCollapse) !== false);

						NodeIconButton(node_6, {
							get title() {
								return `${$.get($0) ?? ''} all`;
							},
							onclick: () => setCollapse($.get(hasExpandedTopLevel)),
							get disabled() {
								return $.get($1);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_7 = $.first_child(fragment_3);

								{
									let $0 = $.derived(() => !$.get(hasExpandedTopLevel));

									$.component(node_7, () => i.ExpandCollapse, ($$anchor, i_ExpandCollapse) => {
										i_ExpandCollapse($$anchor, {
											get expand() {
												return $.get($0);
											},

											get setting() {
												return $.get(settingCollapse);
											}
										});
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					}

					var node_8 = $.sibling(node_6, 2);

					NodeIconButton(node_8, {
						get onclick() {
							return $$props.onlog;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_9 = $.first_child(fragment_4);

							$.component(node_9, () => i.Console, ($$anchor, i_Console) => {
								i_Console($$anchor, {});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_5, ($$render) => {
					if (showExpandCollapse() && !$.get(collapsed)) $$render(consequent_3);
				});
			}

			var node_10 = $.sibling(node_5, 2);

			$.snippet(node_10, () => $$props.headingExtra ?? $.noop);
			$.reset(div_3);
			$.reset(div_1);
			$.template_effect(() => classes = $.set_class(div_1, 1, 'heading svelte-nn2nwk', null, classes, { collapsed: $.get(collapsed) }));
			$.delegated('click', button, () => $.set(collapsed, !$.get(collapsed)));
			$.transition(3, div_1, () => slide, () => ({ axis: 'y', duration: options.transitionDuration }));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($$props.heading || $.get(search)) $$render(consequent_4);
		});
	}

	var node_11 = $.sibling(node, 2);

	{
		var consequent_6 = ($$anchor) => {
			var fragment_5 = root_7();
			var node_12 = $.first_child(fragment_5);

			{
				var consequent_5 = ($$anchor) => {
					var div_4 = root_5();
					var div_5 = $.child(div_4);
					var node_13 = $.child(div_5);

					$.component(node_13, () => i.Search, ($$anchor, i_Search) => {
						i_Search($$anchor, {});
					});

					$.reset(div_5);

					var div_6 = $.sibling(div_5, 2);
					var node_14 = $.child(div_6);

					$.each(node_14, 17, () => typingBuffer.current, $.index, ($$anchor, c, i, $$array) => {
						var div_7 = root_3();
						var text_1 = $.only_child(div_7, true);

						$.template_effect(() => $.set_text(text_1, $.get(c)));
						$.transition(1, div_7, () => slide, () => ({ axis: 'x', duration: options.transitionDuration }));
						$.append($$anchor, div_7);
					});

					var node_15 = $.sibling(node_14);

					$.key(node_15, () => typingBuffer.current, ($$anchor) => {
						var span_1 = root_4();

						$.append($$anchor, span_1);
					});

					$.reset(div_6);
					$.reset(div_4);
					$.transition(3, div_4, () => fly, () => ({ duration: options.transitionDuration, y: 40, opacity: 0 }));
					$.append($$anchor, div_4);
				};

				$.if(node_12, ($$render) => {
					if (typingBuffer.current.length) $$render(consequent_5);
				});
			}

			var div_8 = $.sibling(node_12, 2);
			var node_16 = $.child(div_8);

			{
				const failed = ($$anchor, _ = $.noop, reset = $.noop) => {
					$.next();

					var fragment_6 = root_6();
					var node_17 = $.sibling($.first_child(fragment_6));

					NodeActionButton(node_17, {
						get onclick() {
							return reset();
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('reset');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				};

				$.boundary(node_16, { onerror: console.error, failed }, ($$anchor) => {
					var fragment_7 = $.comment();
					var node_18 = $.first_child(fragment_7);

					$.snippet(node_18, () => $$props.children);
					$.append($$anchor, fragment_7);
				});
			}

			$.reset(div_8);
			$.transition(3, div_8, () => slide, () => ({ duration: options.transitionDuration }));
			$.append($$anchor, fragment_5);
		};

		$.if(node_11, ($$render) => {
			if (!$.get(collapsed)) $$render(consequent_6);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(wrapperEle, $$value), () => $.get(wrapperEle));
	$.attach(div, () => scope(true));
	$.append($$anchor, div);

	return $.pop($$exports);
}

$.delegate(['click']);