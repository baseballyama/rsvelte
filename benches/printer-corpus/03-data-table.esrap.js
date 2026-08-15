import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="arrow"> </span>`);
var root_1 = $.from_html(`<th> <!></th>`);
var root_2 = $.from_html(`<tr><td> </td><td> </td><td class="num svelte-rmw92e"> </td><td><span> </span></td></tr>`);
var root_3 = $.from_html(`<p class="empty">No matching rows.</p>`);
var root_4 = $.from_html(`<div class="table-wrap svelte-rmw92e"><div class="toolbar svelte-rmw92e"><input placeholder="Filter by name…"/> <span class="avg"> </span></div> <table class="svelte-rmw92e"><thead><tr><!><th class="svelte-rmw92e">Status</th></tr></thead><tbody></tbody></table> <!></div>`);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	let sortKey = $.state('name');
	let sortDir = $.state(1);
	let query = $.state('');

	let rows = $.proxy([
		{
			id: 1,
			name: 'Alice',
			role: 'Engineer',
			score: 92,
			active: true
		},

		{
			id: 2,
			name: 'Bob',
			role: 'Designer',
			score: 78,
			active: false
		},

		{
			id: 3,
			name: 'Carol',
			role: 'Manager',
			score: 85,
			active: true
		},

		{
			id: 4,
			name: 'Dave',
			role: 'Engineer',
			score: 64,
			active: true
		},

		{
			id: 5,
			name: 'Erin',
			role: 'Analyst',
			score: 88,
			active: false
		},

		{
			id: 6,
			name: 'Frank',
			role: 'Designer',
			score: 71,
			active: true
		}
	]);

	let filtered = $.derived(() => rows.filter((r) => r.name.toLowerCase().includes($.get(query).toLowerCase())));

	let sorted = $.derived(() => [...$.get(filtered)].sort((a, b) => {
		const av = a[$.get(sortKey)];
		const bv = b[$.get(sortKey)];

		if (av < bv) return -1 * $.get(sortDir);
		if (av > bv) return 1 * $.get(sortDir);

		return 0;
	}));

	let average = $.derived(() => $.get(sorted).length
		? Math.round($.get(sorted).reduce((s, r) => s + r.score, 0) / $.get(sorted).length)
		: 0);

	function sortBy(key) {
		if ($.get(sortKey) === key) {
			$.set(sortDir, $.get(sortDir) * -1);
		} else {
			$.set(sortKey, key, true);
			$.set(sortDir, 1);
		}
	}

	var div = root_4();
	var div_1 = $.child(div);
	var input = $.child(div_1);

	$.remove_input_defaults(input);

	var span = $.sibling(input, 2);
	var text = $.child(span);

	$.reset(span);
	$.reset(div_1);

	var table = $.sibling(div_1, 2);
	var thead = $.child(table);
	var tr = $.child(thead);
	var node = $.child(tr);

	$.each(node, 16, () => [['name', 'Name'], ['role', 'Role'], ['score', 'Score']], $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($$item, 2));
		let key = () => $.get($$array)[0];
		let label = () => $.get($$array)[1];
		var th = root_1();
		let classes;
		var text_1 = $.child(th);
		var node_1 = $.sibling(text_1);

		{
			var consequent = ($$anchor) => {
				var span_1 = root();
				var text_2 = $.child(span_1, true);

				$.reset(span_1);
				$.template_effect(() => $.set_text(text_2, $.get(sortDir) === 1 ? '▲' : '▼'));
				$.append($$anchor, span_1);
			};

			$.if(node_1, ($$render) => {
				if ($.get(sortKey) === key()) $$render(consequent);
			});
		}

		$.reset(th);

		$.template_effect(() => {
			classes = $.set_class(th, 1, 'svelte-rmw92e', null, classes, { sorted: $.get(sortKey) === key() });
			$.set_text(text_1, `${label() ?? ''} `);
		});

		$.delegated('click', th, () => sortBy(key()));
		$.append($$anchor, th);
	});

	$.next();
	$.reset(tr);
	$.reset(thead);

	var tbody = $.sibling(thead);

	$.each(tbody, 21, () => $.get(sorted), (row) => row.id, ($$anchor, row) => {
		var tr_1 = root_2();
		let classes_1;
		var td = $.child(tr_1);
		var text_3 = $.child(td, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var text_4 = $.child(td_1, true);

		$.reset(td_1);

		var td_2 = $.sibling(td_1);
		var text_5 = $.child(td_2, true);

		$.reset(td_2);

		var td_3 = $.sibling(td_2);
		var span_2 = $.child(td_3);
		let classes_2;
		var text_6 = $.child(span_2, true);

		$.reset(span_2);
		$.reset(td_3);
		$.reset(tr_1);

		$.template_effect(() => {
			classes_1 = $.set_class(tr_1, 1, 'svelte-rmw92e', null, classes_1, { inactive: !$.get(row).active });
			$.set_text(text_3, $.get(row).name);
			$.set_text(text_4, $.get(row).role);
			$.set_text(text_5, $.get(row).score);
			classes_2 = $.set_class(span_2, 1, 'badge svelte-rmw92e', null, classes_2, { on: $.get(row).active });
			$.set_text(text_6, $.get(row).active ? 'Active' : 'Inactive');
		});

		$.append($$anchor, tr_1);
	});

	$.reset(tbody);
	$.reset(table);

	var node_2 = $.sibling(table, 2);

	{
		var consequent_1 = ($$anchor) => {
			var p = root_3();

			$.append($$anchor, p);
		};

		$.if(node_2, ($$render) => {
			if ($.get(sorted).length === 0) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_text(text, `Average score: ${$.get(average) ?? ''}`));
	$.bind_value(input, () => $.get(query), ($$value) => $.set(query, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);
