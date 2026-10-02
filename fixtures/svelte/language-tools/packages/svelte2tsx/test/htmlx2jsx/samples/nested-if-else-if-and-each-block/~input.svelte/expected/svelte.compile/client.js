import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {};
				var consequent_1 = ($$anchor) => {};

				$.if(node_1, ($$render) => {
					if (true) $$render(consequent); else if (true) $$render(consequent_1, 1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.each(node_2, 16, () => [], $.index, ($$anchor, _) => {});
			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}