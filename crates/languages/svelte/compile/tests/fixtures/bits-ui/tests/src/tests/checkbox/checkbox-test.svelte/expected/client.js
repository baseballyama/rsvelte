import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'checked', 'onFormSubmit']);
var root = $.from_html(`<span data-testid="indicator"><!></span>`);
var root_1 = $.from_html(`<main><form method="POST"><p data-testid="binding"> </p> <!> <button type="submit" data-testid="submit">Submit</button></form></main>`);

export default function Checkbox_test($$anchor, $$props) {
	$.push($$props, true);

	let checked = $.prop($$props, 'checked', 7, false),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_1();
	var form = $.child(main);
	var p = $.child(form);
	var text = $.only_child(p, true);
	var node = $.sibling(p, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let checked = () => ($$arg0?.()).checked;
			let indeterminate = () => ($$arg0?.()).indeterminate;
			var span = root();
			var node_1 = $.child(span);

			{
				var consequent = ($$anchor) => {
					var text_1 = $.text('indeterminate');

					$.append($$anchor, text_1);
				};

				var alternate = ($$anchor) => {
					var text_2 = $.text();

					$.template_effect(() => $.set_text(text_2, checked()));
					$.append($$anchor, text_2);
				};

				$.if(node_1, ($$render) => {
					if (indeterminate()) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(span);
			$.append($$anchor, span);
		};

		$.component(node, () => Checkbox.Root, ($$anchor, Checkbox_Root) => {
			Checkbox_Root($$anchor, $.spread_props({ name: 'terms', 'data-testid': 'root' }, () => restProps, {
				get checked() {
					return checked();
				},

				set checked($$value) {
					checked($$value);
				},
				children,
				$$slots: { default: true }
			}));
		});
	}

	$.next(2);
	$.reset(form);
	$.reset(main);
	$.template_effect(() => $.set_text(text, checked()));

	$.event('submit', form, (e) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);

		$$props.onFormSubmit?.(formData);
	});

	$.append($$anchor, main);
	$.pop();
}