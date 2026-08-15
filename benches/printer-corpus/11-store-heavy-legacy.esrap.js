import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { writable, derived, get } from 'svelte/store';

var root = $.from_html(`<input/>`);
var root_1 = $.from_html(`<button type="button"> </button>`);
var root_2 = $.from_html(`<tr><td class="svelte-15juqoh"><input type="checkbox"/></td><td class="svelte-15juqoh"> </td><td class="svelte-15juqoh"><!></td><td class="svelte-15juqoh"> </td><td class="svelte-15juqoh"> </td></tr>`);
var root_3 = $.from_html(`<tr><td colspan="5" class="svelte-15juqoh">No matching rows</td></tr>`);
var root_4 = $.from_html(`<section><header><h3> </h3> <input type="search" placeholder="Filter owner"/> <span> </span></header> <table><thead><tr><th class="svelte-15juqoh"><input type="checkbox"/></th><th class="svelte-15juqoh">#</th><th class="svelte-15juqoh">Owner</th><th class="svelte-15juqoh">Status</th><th class="svelte-15juqoh">Estimate</th></tr></thead><tbody></tbody><tfoot><tr><td colspan="4" class="svelte-15juqoh">Total</td><td class="svelte-15juqoh"> </td></tr></tfoot></table></section>`);

export default function Component($$anchor, $$props) {
	$.push($$props, false);

	const $query = () => $.store_get(query, '$query', $$stores);
	const $rows = () => $.store_get(rows, '$rows', $$stores);
	const $sortKey = () => $.store_get(sortKey, '$sortKey', $$stores);
	const $ascending = () => $.store_get(ascending, '$ascending', $$stores);
	const $totals = () => $.store_get(totals, '$totals', $$stores);
	const $selection = () => $.store_get(selection, '$selection', $$stores);
	const $theme = () => $.store_get(theme, '$theme', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const needle = $.mutable_source();
	const matched = $.mutable_source();
	const sorted = $.mutable_source();
	const open = $.mutable_source();
	const blocked = $.mutable_source();
	const overrun = $.mutable_source();
	const selectedCount = $.mutable_source();
	const allSelected = $.mutable_source();
	let boardId = $.prop($$props, 'boardId', 8);
	let title = $.prop($$props, 'title', 8, 'Board');
	let compact = $.prop($$props, 'compact', 8, false);
	const rows = getContext('rows');
	const query = writable('');
	const sortKey = writable('id');
	const ascending = writable(true);
	const selection = writable(new Set());
	const theme = getContext('theme');

	const totals = derived(rows, ($rows) => ({
		estimate: $rows.reduce((n, r) => n + r.estimate, 0),
		spent: $rows.reduce((n, r) => n + r.spent, 0)
	}));

	let editing = $.mutable_source(null);
	let draft = $.mutable_source('');

	function toggle(id) {
		selection.update((set) => {
			const next = new Set(set);

			if (next.has(id)) next.delete(id); else next.add(id);

			return next;
		});
	}

	function toggleAll() {
		selection.set($.get(allSelected) ? new Set() : new Set($.get(sorted).map((r) => r.id)));
	}

	function sortBy(key) {
		if (get(sortKey) === key) ascending.update((v) => !v); else {
			sortKey.set(key);
			ascending.set(true);
		}
	}

	function commit(row) {
		$.store_set(rows, $rows().map((r) => r.id === row.id ? { ...r, owner: $.get(draft) } : r));
		$.set(editing, null);
	}

	$.legacy_pre_effect(() => $query(), () => {
		$.set(needle, $query().trim().toLowerCase());
	});

	$.legacy_pre_effect(() => ($.get(needle), $rows()), () => {
		$.set(matched, $.get(needle)
			? $rows().filter((r) => r.owner.toLowerCase().includes($.get(needle)))
			: $rows());
	});

	$.legacy_pre_effect(() => ($.get(matched), $sortKey(), $ascending()), () => {
		$.set(sorted, [...$.get(matched)].sort((a, b) => {
			const key = $sortKey();
			const dir = $ascending() ? 1 : -1;

			return a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0;
		}));
	});

	$.legacy_pre_effect(() => $.get(sorted), () => {
		$.set(open, $.get(sorted).filter((r) => r.status === 'open').length);
	});

	$.legacy_pre_effect(() => $.get(sorted), () => {
		$.set(blocked, $.get(sorted).filter((r) => r.status === 'blocked').length);
	});

	$.legacy_pre_effect(() => $totals(), () => {
		$.set(overrun, $totals().spent > $totals().estimate);
	});

	$.legacy_pre_effect(() => $selection(), () => {
		$.set(selectedCount, $selection().size);
	});

	$.legacy_pre_effect(() => ($.get(sorted), $.get(selectedCount)), () => {
		$.set(allSelected, $.get(sorted).length > 0 && $.get(selectedCount) === $.get(sorted).length);
	});

	$.legacy_pre_effect(() => ($.get(overrun), $.deep_read_state(boardId()), $totals()), () => {
		if ($.get(overrun)) {
			console.warn('over estimate on', boardId(), $totals().spent, $totals().estimate);
		}
	});

	$.legacy_pre_effect_reset();
	$.init();

	var section = root_4();
	let classes;
	var header = $.child(section);
	var h3 = $.child(header);
	var text = $.child(h3, true);

	$.reset(h3);

	var input = $.sibling(h3, 2);

	$.remove_input_defaults(input);

	var span = $.sibling(input, 2);
	var text_1 = $.child(span);

	$.reset(span);
	$.reset(header);

	var table = $.sibling(header, 2);
	var thead = $.child(table);
	var tr = $.child(thead);
	var th = $.child(tr);
	var input_1 = $.child(th);

	$.remove_input_defaults(input_1);
	$.reset(th);

	var th_1 = $.sibling(th);
	var th_2 = $.sibling(th_1);
	var th_3 = $.sibling(th_2);
	var th_4 = $.sibling(th_3);

	$.reset(tr);
	$.reset(thead);

	var tbody = $.sibling(thead);

	$.each(
		tbody,
		5,
		() => $.get(sorted),
		(row) => row.id,
		($$anchor, row) => {
			var tr_1 = root_2();
			let classes_1;
			var td = $.child(tr_1);
			var input_2 = $.child(td);

			$.reset(td);

			var td_1 = $.sibling(td);
			var text_2 = $.child(td_1, true);

			$.reset(td_1);

			var td_2 = $.sibling(td_1);
			var node = $.child(td_2);

			{
				var consequent = ($$anchor) => {
					var input_3 = root();

					$.remove_input_defaults(input_3);
					$.bind_value(input_3, () => $.get(draft), ($$value) => $.set(draft, $$value));
					$.event('blur', input_3, () => commit($.get(row)));
					$.append($$anchor, input_3);
				};

				var alternate = ($$anchor) => {
					var button = root_1();
					var text_3 = $.child(button, true);

					$.reset(button);
					$.template_effect(() => $.set_text(text_3, ($.get(row), $.untrack(() => $.get(row).owner))));

					$.event('click', button, () => {
						$.set(editing, $.get(row).id);
						$.set(draft, $.get(row).owner);
					});

					$.append($$anchor, button);
				};

				$.if(node, ($$render) => {
					if ((
						$.get(editing),
						$.get(row),
						$.untrack(() => $.get(editing) === $.get(row).id)
					)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(td_2);

			var td_3 = $.sibling(td_2);
			var text_4 = $.child(td_3, true);

			$.reset(td_3);

			var td_4 = $.sibling(td_3);
			var text_5 = $.child(td_4);

			$.reset(td_4);
			$.reset(tr_1);

			$.template_effect(
				($0) => {
					classes_1 = $.set_class(tr_1, 1, 'svelte-15juqoh', null, classes_1, $0);
					$.set_text(text_2, ($.get(row), $.untrack(() => $.get(row).id)));
					$.set_text(text_4, ($.get(row), $.untrack(() => $.get(row).status)));
					$.set_text(text_5, `${($.get(row), $.untrack(() => $.get(row).estimate)) ?? ''}h / ${($.get(row), $.untrack(() => $.get(row).spent)) ?? ''}h`);
				},
				[
					() => ({
						selected: $selection().has($.get(row).id),
						blocked: $.get(row).status === 'blocked'
					})
				]
			);

			$.event('change', input_2, () => toggle($.get(row).id));
			$.append($$anchor, tr_1);
		},
		($$anchor) => {
			var tr_2 = root_3();

			$.append($$anchor, tr_2);
		}
	);

	$.reset(tbody);

	var tfoot = $.sibling(tbody);
	var tr_3 = $.child(tfoot);
	let classes_2;
	var td_5 = $.sibling($.child(tr_3));
	var text_6 = $.child(td_5);

	$.reset(td_5);
	$.reset(tr_3);
	$.reset(tfoot);
	$.reset(table);
	$.reset(section);

	$.template_effect(() => {
		classes = $.set_class(section, 1, `board ${$theme() ?? ''}`, 'svelte-15juqoh', classes, { compact: compact() });
		$.set_text(text, title());
		$.set_text(text_1, `${$.get(open) ?? ''} open · ${$.get(blocked) ?? ''} blocked · ${$.get(selectedCount) ?? ''} selected`);
		$.set_checked(input_1, $.get(allSelected));
		classes_2 = $.set_class(tr_3, 1, 'svelte-15juqoh', null, classes_2, { overrun: $.get(overrun) });
		$.set_text(text_6, `${($totals(), $.untrack(() => $totals().estimate)) ?? ''}h / ${($totals(), $.untrack(() => $totals().spent)) ?? ''}h`);
	});

	$.bind_value(input, $query, ($$value) => $.store_set(query, $$value));
	$.event('change', input_1, toggleAll);
	$.event('click', th_1, () => sortBy('id'));
	$.event('click', th_2, () => sortBy('owner'));
	$.event('click', th_3, () => sortBy('status'));
	$.event('click', th_4, () => sortBy('estimate'));
	$.append($$anchor, section);
	$.pop();
	$$cleanup();
}
