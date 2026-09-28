import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge, Icon, Spinner } from '@appwrite.io/pink-svelte';
import { IconPlus, IconPencil, IconCheck, IconExclamationCircle } from '@appwrite.io/pink-icons-svelte';
import { InputSearch } from '$lib/elements/forms';
import { WILDCARD_IDENTIFIER } from '$lib/helpers/oauth2-authorization-details';

var root = $.from_html(`<span class="default-tag svelte-jbm919">Default</span>`);
var root_1 = $.from_html(`<div class="mode svelte-jbm919" role="group"><button type="button"> </button> <button type="button"> </button></div>`);
var root_2 = $.from_html(`<span class="chip svelte-jbm919"><span> </span> <!> <button type="button" class="chip-remove svelte-jbm919">×</button></span>`);
var root_3 = $.from_html(`<div class="chips svelte-jbm919"></div>`);
var root_4 = $.from_html(`<li class="results-state svelte-jbm919"><!></li>`);
var root_5 = $.from_html(`<li class="results-state svelte-jbm919"> </li>`);
var root_6 = $.from_html(`<li class="svelte-jbm919"><button type="button" class="result svelte-jbm919"><span class="result-text svelte-jbm919"><span class="result-name svelte-jbm919"> </span> <!></span> <!></button></li>`);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<!> <ul class="results svelte-jbm919"><!></ul>`, 1);
var root_9 = $.from_html(`<div class="body svelte-jbm919"><!> <!> <!></div>`);
var root_10 = $.from_html(`<div class="selector svelte-jbm919"><div class="summary-row svelte-jbm919"><span><!> <span class="summary-text svelte-jbm919"> </span> <!></span> <button type="button"><!> </button></div> <!></div>`);

export default function Resource_selector($$anchor, $$props) {
	$.push($$props, true);

	const PAGE_SIZE = 8;

	/** Plural label, e.g. `projects`. */
	/** Identifiers the client requested (may be `['*']`). Defines the universe. */
	/** Current selection (`['*']` = all). Two-way bound to the parent. */
	/** Paginated live search over the selectable universe. */
	/** Resolve specific requested ids to display names. */
	let selected = $.prop($$props, 'selected', 15),
		disabled = $.prop($$props, 'disabled', 3, false);

	const wildcard = $.derived(() => $$props.requested.includes(WILDCARD_IDENTIFIER));
	const isAll = $.derived(() => selected().includes(WILDCARD_IDENTIFIER));
	const specificIds = $.derived(() => selected().filter((id) => id !== WILDCARD_IDENTIFIER));

	// Nothing selected — the tier grants nothing until the user picks a resource.
	const isEmpty = $.derived(() => !$.get(isAll) && $.get(specificIds).length === 0);

	// Whether the current selection still matches exactly what was requested.
	const isDefault = $.derived(() => selected().length === $$props.requested.length && selected().every((id) => $$props.requested.includes(id)));

	// Search (which can *add* resources) is only offered when narrowing a
	// wildcard grant — every match is still within the requested `*`, so it stays
	// downscope-only. A specific requested list is fixed: the user can remove
	// from it but never add resources the client didn't ask for.
	const searchable = $.derived(() => $.get(wildcard) && !$.get(isAll));

	let expanded = $.state(false);
	let names = $.state($.proxy({}));
	let term = $.state('');
	let results = $.state($.proxy([]));
	let searching = $.state(false);
	let loadingMore = $.state(false);
	let hasMore = $.state(false);

	function labelFor(id) {
		return $.get(names)[id] ?? { id, name: id, resolved: false };
	}

	// Resolve the requested specific ids so chips show real names.
	$.user_effect(() => {
		const ids = $$props.requested.filter((id) => id !== WILDCARD_IDENTIFIER);

		if (ids.length === 0) return;

		let cancelled = false;

		void $$props.resolveNames(ids).then((map) => {
			if (!cancelled) $.set(names, { ...$.get(names), ...Object.fromEntries(map) }, true);
		});

		return () => {
			cancelled = true;
		};
	});

	// Debounced live search while the picker is open and searchable.
	$.user_effect(() => {
		if (!$.get(expanded) || !$.get(searchable)) return;

		const t = $.get(term);
		let cancelled = false;

		$.set(searching, true);
		$.set(loadingMore, false);
		$.set(hasMore, false);
		$.set(results, [], true);

		const timer = setTimeout(
			() => {
				void $$props.find(t, 0, PAGE_SIZE).then((page) => {
					if (cancelled) return;

					$.set(results, page.resources, true);
					$.set(hasMore, page.hasMore, true);

					const merged = { ...$.get(names) };

					for (const r of page.resources) merged[r.id] = r;

					$.set(names, merged, true);
					$.set(searching, false);
				});
			},
			250
		);

		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	});

	async function loadMore() {
		if ($.get(searching) || $.get(loadingMore) || !$.get(hasMore)) return;

		const currentTerm = $.get(term);
		const offset = $.get(results).length;

		$.set(loadingMore, true);

		try {
			const page = await $$props.find(currentTerm, offset, PAGE_SIZE);

			if (currentTerm !== $.get(term)) return;

			const seen = new Set($.get(results).map((resource) => resource.id));
			const next = page.resources.filter((resource) => !seen.has(resource.id));

			$.set(results, [...$.get(results), ...next], true);
			$.set(hasMore, page.hasMore, true);

			const merged = { ...$.get(names) };

			for (const resource of next) merged[resource.id] = resource;

			$.set(names, merged, true);
		} finally {
			$.set(loadingMore, false);
		}
	}

	function handleResultsScroll(event) {
		const list = event.currentTarget;

		if (list.scrollTop + list.clientHeight >= list.scrollHeight - 24) {
			void loadMore();
		}
	}

	const suggestions = $.derived(() => $.get(results).filter((r) => !selected().includes(r.id)));

	function setAll(all) {
		selected(all ? [WILDCARD_IDENTIFIER] : []);
	}

	function add(id) {
		if (selected().includes(id)) return;

		selected([...selected().filter((x) => x !== WILDCARD_IDENTIFIER), id]);

		if ($.get(hasMore)) queueMicrotask(() => void loadMore());
	}

	function remove(id) {
		selected(selected().filter((x) => x !== id));
	}

	const summary = $.derived(() => {
		if ($.get(isAll)) return `All ${$$props.pluralLabel}`;
		if ($.get(specificIds).length === 0) return `No ${$$props.pluralLabel} selected`;
		if ($.get(specificIds).length <= 2) return $.get(specificIds).map((id) => labelFor(id).name).join(', ');

		return `${$.get(specificIds).length} ${$$props.pluralLabel}`;
	});

	var div = root_10();
	var div_1 = $.child(div);
	var span = $.child(div_1);
	let classes;
	var node = $.child(span);

	{
		var consequent = ($$anchor) => {
			Icon($$anchor, {
				get icon() {
					return IconExclamationCircle;
				},
				size: 's'
			});
		};

		$.if(node, ($$render) => {
			if ($.get(isEmpty)) $$render(consequent);
		});
	}

	var span_1 = $.sibling(node, 2);
	var text = $.only_child(span_1, true);
	var node_1 = $.sibling(span_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var span_2 = root();

			$.append($$anchor, span_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(isDefault)) $$render(consequent_1);
		});
	}

	$.reset(span);

	var button = $.sibling(span, 2);
	let classes_1;
	var node_2 = $.child(button);

	{
		let $0 = $.derived(() => $.get(expanded) ? IconCheck : IconPencil);

		Icon(node_2, {
			get icon() {
				return $.get($0);
			},
			size: 's'
		});
	}

	var text_1 = $.sibling(node_2);

	$.reset(button);
	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_2 = root_9();
			var node_4 = $.child(div_2);

			{
				var consequent_2 = ($$anchor) => {
					var div_3 = root_1();
					var button_1 = $.child(div_3);
					let classes_2;
					var text_2 = $.only_child(button_1);
					var button_2 = $.sibling(button_1, 2);
					let classes_3;
					var text_3 = $.only_child(button_2);

					$.reset(div_3);

					$.template_effect(() => {
						classes_2 = $.set_class(button_1, 1, 'seg svelte-jbm919', null, classes_2, { active: $.get(isAll) });
						button_1.disabled = disabled();
						$.set_text(text_2, `All ${$$props.pluralLabel ?? ''}`);
						classes_3 = $.set_class(button_2, 1, 'seg svelte-jbm919', null, classes_3, { active: !$.get(isAll) });
						button_2.disabled = disabled();
						$.set_text(text_3, `Specific ${$$props.pluralLabel ?? ''}`);
					});

					$.delegated('click', button_1, () => setAll(true));
					$.delegated('click', button_2, () => setAll(false));
					$.append($$anchor, div_3);
				};

				$.if(node_4, ($$render) => {
					if ($.get(wildcard)) $$render(consequent_2);
				});
			}

			var node_5 = $.sibling(node_4, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_4 = root_3();

					$.each(div_4, 20, () => $.get(specificIds), (id) => id, ($$anchor, id) => {
						const r = $.derived(() => labelFor(id));
						var span_3 = root_2();
						var span_4 = $.child(span_3);
						let classes_4;
						var text_4 = $.only_child(span_4, true);
						var node_6 = $.sibling(span_4, 2);

						{
							var consequent_3 = ($$anchor) => {
								Badge($$anchor, {
									size: 'xs',
									variant: 'secondary',
									get content() {
										return $.get(r).region;
									}
								});
							};

							$.if(node_6, ($$render) => {
								if ($.get(r).region) $$render(consequent_3);
							});
						}

						var button_3 = $.sibling(node_6, 2);

						$.reset(span_3);

						$.template_effect(() => {
							classes_4 = $.set_class(span_4, 1, 'chip-name svelte-jbm919', null, classes_4, { mono: !$.get(r).resolved });
							$.set_text(text_4, $.get(r).name);
							$.set_attribute(button_3, 'aria-label', `Remove ${$.get(r).name}`);
							button_3.disabled = disabled();
						});

						$.delegated('click', button_3, () => remove(id));
						$.append($$anchor, span_3);
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				$.if(node_5, ($$render) => {
					if ($.get(specificIds).length > 0) $$render(consequent_4);
				});
			}

			var node_7 = $.sibling(node_5, 2);

			{
				var consequent_9 = ($$anchor) => {
					var fragment_2 = root_8();
					var node_8 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => `Search ${$$props.pluralLabel} by name`);

						InputSearch(node_8, {
							get placeholder() {
								return $.get($0);
							},

							get disabled() {
								return disabled();
							},

							get value() {
								return $.get(term);
							},

							set value($$value) {
								$.set(term, $$value, true);
							}
						});
					}

					var ul = $.sibling(node_8, 2);
					var node_9 = $.child(ul);

					{
						var consequent_5 = ($$anchor) => {
							var li = root_4();
							var node_10 = $.child(li);

							Spinner(node_10, { size: 's' });
							$.reset(li);
							$.append($$anchor, li);
						};

						var consequent_6 = ($$anchor) => {
							var li_1 = root_5();
							var text_5 = $.only_child(li_1, true);

							$.template_effect(($0) => $.set_text(text_5, $0), [
								() => $.get(term).trim()
									? `No matching ${$$props.pluralLabel}`
									: `Type to search ${$$props.pluralLabel}`
							]);

							$.append($$anchor, li_1);
						};

						var alternate = ($$anchor) => {
							var fragment_3 = root_7();
							var node_11 = $.first_child(fragment_3);

							$.each(node_11, 17, () => $.get(suggestions), (r) => r.id, ($$anchor, r) => {
								var li_2 = root_6();
								var button_4 = $.child(li_2);
								var span_5 = $.child(button_4);
								var span_6 = $.child(span_5);
								var text_6 = $.only_child(span_6, true);
								var node_12 = $.sibling(span_6, 2);

								{
									var consequent_7 = ($$anchor) => {
										Badge($$anchor, {
											size: 'xs',
											variant: 'secondary',
											get content() {
												return $.get(r).region;
											}
										});
									};

									$.if(node_12, ($$render) => {
										if ($.get(r).region) $$render(consequent_7);
									});
								}

								$.reset(span_5);

								var node_13 = $.sibling(span_5, 2);

								Icon(node_13, {
									get icon() {
										return IconPlus;
									},
									size: 's'
								});

								$.reset(button_4);
								$.reset(li_2);

								$.template_effect(() => {
									button_4.disabled = disabled();
									$.set_text(text_6, $.get(r).name);
								});

								$.delegated('click', button_4, () => add($.get(r).id));
								$.append($$anchor, li_2);
							});

							var node_14 = $.sibling(node_11, 2);

							{
								var consequent_8 = ($$anchor) => {
									var li_3 = root_4();
									var node_15 = $.child(li_3);

									Spinner(node_15, { size: 's' });
									$.reset(li_3);
									$.append($$anchor, li_3);
								};

								$.if(node_14, ($$render) => {
									if ($.get(loadingMore)) $$render(consequent_8);
								});
							}

							$.append($$anchor, fragment_3);
						};

						$.if(node_9, ($$render) => {
							if ($.get(searching)) $$render(consequent_5); else if ($.get(suggestions).length === 0) $$render(consequent_6, 1); else $$render(alternate, -1);
						});
					}

					$.reset(ul);
					$.event('scroll', ul, handleResultsScroll);
					$.append($$anchor, fragment_2);
				};

				$.if(node_7, ($$render) => {
					if ($.get(searchable)) $$render(consequent_9);
				});
			}

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_3, ($$render) => {
			if ($.get(expanded)) $$render(consequent_10);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(span, 1, 'summary svelte-jbm919', null, classes, { empty: $.get(isEmpty) });
		$.set_text(text, $.get(summary));
		classes_1 = $.set_class(button, 1, 'toggle svelte-jbm919', null, classes_1, { active: $.get(expanded) });
		button.disabled = disabled();
		$.set_text(text_1, ` ${$.get(expanded) ? 'Done' : 'Change'}`);
	});

	$.delegated('click', button, () => $.set(expanded, !$.get(expanded)));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);