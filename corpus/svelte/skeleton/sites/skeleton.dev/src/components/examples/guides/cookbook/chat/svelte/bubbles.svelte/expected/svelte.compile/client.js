import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="grid grid-cols-[auto_1fr] gap-2"><div class="card p-4 preset-tonal rounded-tl-none space-y-2"><header class="flex justify-between items-center"><p class="font-bold"> </p> <small class="opacity-50"> </small></header> <p> </p></div></div>`);
var root_1 = $.from_html(`<div class="grid grid-cols-[1fr_auto] gap-2"><div><header class="flex justify-between items-center"><p class="font-bold"> </p> <small class="opacity-50"> </small></header> <p> </p></div></div>`);
var root_2 = $.from_html(`<section class="w-full max-h-[400px] overflow-y-auto space-y-4"></section>`);

export default function Bubbles($$anchor) {
	const messageFeed = [
		{
			id: 0,
			host: true,
			avatar: 48,
			name: 'Jane',
			timestamp: 'Yesterday @ 2:30pm',
			message: 'Some message text.',
			color: 'preset-tonal-primary'
		},

		{
			id: 1,
			host: false,
			avatar: 14,
			name: 'Michael',
			timestamp: 'Yesterday @ 2:45pm',
			message: 'Some message text.',
			color: 'preset-tonal-primary'
		}
	];

	var section = root_2();

	$.each(section, 21, () => messageFeed, $.index, ($$anchor, bubble) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div = root();
				var div_1 = $.child(div);
				var header = $.child(div_1);
				var p = $.child(header);
				var text = $.only_child(p, true);
				var small = $.sibling(p, 2);
				var text_1 = $.only_child(small, true);

				$.reset(header);

				var p_1 = $.sibling(header, 2);
				var text_2 = $.only_child(p_1, true);

				$.reset(div_1);
				$.reset(div);

				$.template_effect(() => {
					$.set_text(text, $.get(bubble).name);
					$.set_text(text_1, $.get(bubble).timestamp);
					$.set_text(text_2, $.get(bubble).message);
				});

				$.append($$anchor, div);
			};

			var alternate = ($$anchor) => {
				var div_2 = root_1();
				var div_3 = $.child(div_2);
				var header_1 = $.child(div_3);
				var p_2 = $.child(header_1);
				var text_3 = $.only_child(p_2, true);
				var small_1 = $.sibling(p_2, 2);
				var text_4 = $.only_child(small_1, true);

				$.reset(header_1);

				var p_3 = $.sibling(header_1, 2);
				var text_5 = $.only_child(p_3, true);

				$.reset(div_3);
				$.reset(div_2);

				$.template_effect(() => {
					$.set_class(div_3, 1, `card p-4 rounded-tr-none space-y-2 ${$.get(bubble).color}`);
					$.set_text(text_3, $.get(bubble).name);
					$.set_text(text_4, $.get(bubble).timestamp);
					$.set_text(text_5, $.get(bubble).message);
				});

				$.append($$anchor, div_2);
			};

			$.if(node, ($$render) => {
				if ($.get(bubble).host) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(section);
	$.append($$anchor, section);
}