import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>update</button> <div> </div> <div> </div> <div> </div> <div> </div>`, 1);

export default function Main($$anchor) {
	let thing = $.state(void 0);

	function update() {
		let data = $.state($.proxy({ name: 1, position: 1 }));
		let position = $.derived(() => $.get(data).position);
		let name = $.derived(() => $.get(data).name);

		$.set(
			thing,
			{
				get data() {
					return $.get(data);
				},

				get position() {
					return $.get(position);
				},

				get name() {
					return $.get(name);
				}
			},
			true
		);

		$.get(thing).position;
		$.set(data, { name: 2, position: 2 }, true);
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var div = $.sibling(button, 2);
	var text = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1, true);
	var div_2 = $.sibling(div_1, 2);
	var text_2 = $.only_child(div_2, true);
	var div_3 = $.sibling(div_2, 2);
	var text_3 = $.only_child(div_3, true);

	$.template_effect(() => {
		$.set_text(text, $.get(thing)?.data?.name);
		$.set_text(text_1, $.get(thing)?.name);
		$.set_text(text_2, $.get(thing)?.data?.position);
		$.set_text(text_3, $.get(thing)?.position);
	});

	$.delegated('click', button, update);
	$.append($$anchor, fragment);
}

$.delegate(['click']);