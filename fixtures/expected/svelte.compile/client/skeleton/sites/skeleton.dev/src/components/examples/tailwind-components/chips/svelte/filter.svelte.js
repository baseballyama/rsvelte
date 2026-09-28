import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from '@lucide/svelte/icons/check';

var root = $.from_html(`<button><!> <span> </span></button>`);
var root_1 = $.from_html(`<div class="card preset-filled-surface-100-900 w-full max-w-md p-4"><div class="flex justify-center items-center gap-2"><span class="text-sm opacity-60">Favorite Color</span> <!></div></div>`);

export default function Filter($$anchor) {
	const colors = ['red', 'green', 'blue'];
	let color = $.state($.proxy(colors[0]));

	function setColor(selectedColor) {
		$.set(color, selectedColor, true);
	}

	var div = root_1();
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 2);

	$.each(node, 16, () => colors, (c) => c, ($$anchor, c) => {
		var button = root();
		var node_1 = $.child(button);

		{
			var consequent = ($$anchor) => {
				CheckIcon($$anchor, { size: 14 });
			};

			$.if(node_1, ($$render) => {
				if ($.get(color) === c) $$render(consequent);
			});
		}

		var span = $.sibling(node_1, 2);
		var text = $.only_child(span, true);

		$.reset(button);

		$.template_effect(() => {
			$.set_class(button, 1, `chip capitalize preset-outlined-surface-400-600 ${$.get(color) === c ? 'preset-tonal-primary' : ''}`);
			$.set_text(text, c);
		});

		$.delegated('click', button, () => setColor(c));
		$.append($$anchor, button);
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}

$.delegate(['click']);