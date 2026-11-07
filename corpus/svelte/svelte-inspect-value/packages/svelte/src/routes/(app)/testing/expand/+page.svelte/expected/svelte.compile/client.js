import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/Inspect.svelte';

var root = $.from_html(`<label>parse <input type="checkbox"/></label> <!>`, 1);

export default function _page($$anchor) {
	let data = {
		a: `{}`,
		b: `[`,
		c: '[ "a", "b", "c", 1, 2, 3, true,false, { "a": [1,2,3] } ]'
	};

	let nestedData = {
		a: `{}`,
		b: {
			a: `{}`,
			b: `[`,
			b2: `{`,
			c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
			d: JSON.stringify(data),
			e: {
				a: `{}`,
				b: `[`,
				b2: `{`,
				c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
				d: JSON.stringify(data),
				e: {}
			}
		},
		b2: `{`,
		c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
		d: JSON.stringify(data),
		e: {
			a: {
				a: `{}`,
				b: `[`,
				b2: `{`,
				c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
				d: JSON.stringify(data),
				e: {}
			},
			b: `[`,
			b2: `{`,
			c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
			d: JSON.stringify(data),
			e: {
				a: `{}`,
				b: `[`,
				b2: `{`,
				c: '[ "a", "b", "c", 1, 2, 3, true,false,null ]',
				d: JSON.stringify(data),
				e: {}
			}
		}
	};

	let expandAll = $.state(false);
	var fragment = root();
	var label = $.first_child(fragment);
	var input = $.sibling($.child(label));

	$.remove_input_defaults(input);
	$.reset(label);

	var node = $.sibling(label, 2);

	$.key(node, () => $.get(expandAll), ($$anchor) => {
		Inspect($$anchor, {
			get value() {
				return nestedData;
			},
			parseJson: true,
			get expandAll() {
				return $.get(expandAll);
			}
		});
	});

	$.bind_checked(input, () => $.get(expandAll), ($$value) => $.set(expandAll, $$value));
	$.append($$anchor, fragment);
}