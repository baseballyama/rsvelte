import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const func = 100;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			const computed_const = $.derived(() => {
				const [func_1] = [[12, 13, 14]];

				return { func_1 };
			});

			var text = $.text();

			$.template_effect(($0) => $.set_text(text, $0), [() => (() => JSON.stringify($.get(computed_const).func_1))()]);
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}