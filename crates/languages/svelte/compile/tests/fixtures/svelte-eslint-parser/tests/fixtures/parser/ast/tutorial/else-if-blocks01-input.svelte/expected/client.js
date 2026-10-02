import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Else_if_blocks01_input($$anchor) {
	let x = 7;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var p = root();

			p.textContent = '7 is greater than 10';
			$.append($$anchor, p);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					var p_1 = root();

					p_1.textContent = '7 is less than 5';
					$.append($$anchor, p_1);
				};

				var alternate = ($$anchor) => {
					var p_2 = root();

					p_2.textContent = '7 is between 5 and 10';
					$.append($$anchor, p_2);
				};

				$.if(node_1, ($$render) => {
					if (5 > x) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (x > 10) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
}