import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>A</p>`);
var root_1 = $.from_html(`<span></span>`);
var root_2 = $.from_html(`<span>many</span>`);
var root_3 = $.from_html(`<div><!></div>`);
var root_4 = $.from_html(`<em>zero</em>`);
var root_5 = $.from_html(`<!> <!> <strong>tail</strong>`, 1);

export default function Nested_svue($$anchor) {
	let a = true;
	let b = false;
	let n = 0;
	var fragment = root_5();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		var alternate = ($$anchor) => {
			var div = root_3();
			var node_1 = $.child(div);

			{
				var consequent_1 = ($$anchor) => {
					var span = root_1();

					span.textContent = 'B 0';
					$.append($$anchor, span);
				};

				var consequent_2 = ($$anchor) => {
					var span_1 = root_2();

					$.append($$anchor, span_1);
				};

				$.if(node_1, ($$render) => {
					if (b) $$render(consequent_1); else if (n > 1) $$render(consequent_2, 1);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (a) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var text = $.sibling(node, 1, true);

	text.nodeValue = '0';

	var node_2 = $.sibling(text);

	{
		var consequent_3 = ($$anchor) => {
			var em = root_4();

			$.append($$anchor, em);
		};

		$.if(node_2, ($$render) => {
			if (n === 0) $$render(consequent_3);
		});
	}

	$.next(2);
	$.append($$anchor, fragment);
}