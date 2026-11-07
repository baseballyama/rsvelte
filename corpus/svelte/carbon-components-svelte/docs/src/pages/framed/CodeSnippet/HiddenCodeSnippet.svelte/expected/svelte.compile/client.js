import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CodeSnippet, Stack, Toggle } from "carbon-components-svelte";

var root = $.from_html(`<h5>"Show more" will not render</h5> <br/>`, 1);
var root_1 = $.from_html(`<br/><br/> <h5>"Show more" will render</h5> <br/> <div><!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <div><!></div> <!>`, 1);

export default function HiddenCodeSnippet($$anchor, $$props) {
	$.push($$props, true);

	let toggled = false;
	const code = Array.from({ length: 20 }, (_, i) => i + 1).join("\n");

	Stack($$anchor, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			Toggle(node, {
				size: 'sm',
				labelText: 'Show code snippets',
				get toggled() {
					return toggled;
				},

				set toggled($$value) {
					toggled = $$value;
				}
			});

			var node_1 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root();

					$.next(2);
					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if (toggled) $$render(consequent);
				});
			}

			var div = $.sibling(node_1, 2);
			let classes;
			var node_2 = $.child(div);

			CodeSnippet(node_2, {
				type: 'multi',
				get code() {
					return code;
				}
			});

			$.reset(div);

			var node_3 = $.sibling(div, 2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_3 = root_1();
					var div_1 = $.sibling($.first_child(fragment_3), 7);
					let classes_1;
					var node_4 = $.child(div_1);

					CodeSnippet(node_4, {
						type: 'multi',
						get code() {
							return code;
						}
					});

					$.reset(div_1);
					$.template_effect(() => classes_1 = $.set_class(div_1, 1, 'svelte-p2s89v', null, classes_1, { hidden: !toggled }));
					$.append($$anchor, fragment_3);
				};

				$.if(node_3, ($$render) => {
					if (toggled) $$render(consequent_1);
				});
			}

			$.template_effect(() => classes = $.set_class(div, 1, 'svelte-p2s89v', null, classes, { hidden: !toggled }));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}