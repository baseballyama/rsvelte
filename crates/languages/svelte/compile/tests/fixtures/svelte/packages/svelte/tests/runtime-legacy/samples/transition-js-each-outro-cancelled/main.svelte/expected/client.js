import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<section></section>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function fade(node) {
		return {
			duration: 400,
			tick(t) {
				node.setAttribute('t', t);
			}
		};
	}

	let shown = true;
	let _id = 1;
	let items = [];
	const toggle = () => shown = !shown;

	const add = () => {
		items = items.concat({ _id, name: `Thing ${_id}` });
		_id++;
	};

	const remove = (id) => items = items.filter(({ _id }) => _id !== id);
	var $$exports = { toggle, add, remove };
	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var section = root_1();

			$.each(section, 21, () => items, (thing) => thing._id, ($$anchor, thing) => {
				var div = root();
				var text = $.only_child(div, true);

				$.template_effect(() => $.set_text(text, $.get(thing).name));
				$.transition(1, div, () => fade);
				$.transition(2, div, () => fade);
				$.append($$anchor, div);
			});

			$.reset(section);
			$.transition(3, section, () => fade);
			$.append($$anchor, section);
		};

		$.if(node_1, ($$render) => {
			if (shown) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}