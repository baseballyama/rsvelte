import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Select, { Option } from '@smui/select';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="margins"><form><!> <!></form> <div style="margin-top: 1em;"><pre class="status"> </pre></div></div>`);

export default function _Forms($$anchor) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let value = $.state('');
	let received = $.state(void 0);

	function handleSubmit(e) {
		e.preventDefault();
		$.set(received, e.currentTarget['fruit'].value, true);
	}

	var div = root_1();
	var form = $.child(div);
	var node = $.child(form);

	Select(node, {
		label: 'Fruit',
		hiddenInput: true,
		input$name: 'fruit',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Option(node_1, { value: '' });

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 17, () => fruits, $.index, ($$anchor, fruit) => {
				Option($$anchor, {
					get value() {
						return $.get(fruit);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(fruit)));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Button(node_3, {
		type: 'submit',
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Submit');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(form);

	var div_1 = $.sibling(form, 2);
	var pre = $.child(div_1);
	var text_2 = $.only_child(pre);

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text_2, `Received: ${($.get(received) != null ? $.get(received) : 'Not submitted yet.') ?? ''}`));
	$.event('submit', form, handleSubmit);
	$.append($$anchor, div);
}