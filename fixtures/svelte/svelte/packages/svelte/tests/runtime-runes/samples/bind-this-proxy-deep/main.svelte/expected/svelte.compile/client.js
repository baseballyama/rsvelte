import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Row from "./Component.svelte";

var root = $.from_html(`<button>Add</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const nums = $.proxy([]);
	const rows = $.derived(() => nums.map((n) => ({ id: n, name: `Row ${n}` })));
	const refs = $.proxy({});

	$.user_effect(() => {
		console.log({ ...refs });
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 17, () => $.get(rows), (row) => row.id, ($$anchor, row) => {
		$.bind_this(
			Row($$anchor, {
				get name() {
					return $.get(row).name;
				}
			}),
			($$value, row) => refs[row.id] = $$value,
			(row) => refs?.[row.id],
			() => [$.get(row)]
		);
	});

	$.delegated('click', button, () => nums.push(nums.length));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);