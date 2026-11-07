import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SpatialMenu } from "$lib/builders/SpatialMenu.svelte.js";

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div></div>`);

export default function SpatialMenuNavTest($$anchor, $$props) {
	$.push($$props, true);

	const wrap = $.prop($$props, 'wrap', 3, false),
		crossAxis = $.prop($$props, 'crossAxis', 3, false);

	const cols = $$props.initial[0]?.split(" ").length ?? 0;
	let highlighted = $.state(void 0);
	const rows = [];

	$$props.initial.forEach((row, rowIndex) => {
		const res = [];
		const cols = row.split(" ");

		cols.forEach((col, colIndex) => {
			const id = `${rowIndex}-${colIndex}`;

			res.push({ id, disabled: col === "x" });

			if (col === "h") {
				$.set(highlighted, id);
			}
		});

		rows.push(res);
	});

	const menu = new SpatialMenu({
		highlighted: () => $.get(highlighted),
		onHighlightChange: (id) => {
			$.set(highlighted, id, true);
		},
		wrap: wrap(),
		crossAxis: crossAxis()
	});

	const getHighlighted = () => $.get(highlighted);
	var $$exports = { getHighlighted };
	var div = root_1();

	$.attribute_effect(
		div,
		() => ({
			style: `grid-template-columns: repeat(${cols ?? ''}, 1fr);`,
			...menu.root,
			'data-testid': 'spatial-root'
		}),
		void 0,
		void 0,
		void 0,
		'svelte-13vftyf'
	);

	$.each(div, 21, () => rows, $.index, ($$anchor, row) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.each(node, 17, () => $.get(row), $.index, ($$anchor, col) => {
			const item = $.derived(() => menu.getItem($.get(col).id, { disabled: $.get(col).disabled }));
			var div_1 = root();

			$.attribute_effect(div_1, () => ({ ...$.get(item).attrs, 'data-testid': 'spatial-item' }), void 0, void 0, void 0, 'svelte-13vftyf');

			var text = $.only_child(div_1, true);

			$.template_effect(() => $.set_text(text, $.get(col).id));
			$.append($$anchor, div_1);
		});

		$.append($$anchor, fragment);
	});

	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}