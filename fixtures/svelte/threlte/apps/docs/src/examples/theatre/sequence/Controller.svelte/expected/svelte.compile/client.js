import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PauseIcon, PlayIcon } from './icons';

var root = $.from_html(`<button><!></button>`);
var root_1 = $.from_html(`<menu class="svelte-1og7xza"><!> <button> </button> <input type="range" class="svelte-1og7xza"/> <div class="svelte-1og7xza"> </div></menu>`);

export default function Controller($$anchor, $$props) {
	$.push($$props, true);

	let position = $.prop($$props, 'position', 15),
		rate = $.prop($$props, 'rate', 15, 1);

	const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

	const toggleRate = () => {
		if (rate() == 1) {
			rate(0.5);
		} else if (rate() == 0.5) {
			rate(2);
		} else {
			rate(1);
		}
	};

	var menu = root_1();
	var node = $.child(menu);

	{
		var consequent = ($$anchor) => {
			var button = root();
			var node_1 = $.child(button);

			PlayIcon(node_1, {});
			$.reset(button);
			$.delegated('click', button, () => $$props.play?.());
			$.append($$anchor, button);
		};

		var alternate = ($$anchor) => {
			var button_1 = root();
			var node_2 = $.child(button_1);

			PauseIcon(node_2, {});
			$.reset(button_1);
			$.delegated('click', button_1, () => $$props.pause?.());
			$.append($$anchor, button_1);
		};

		$.if(node, ($$render) => {
			if (!$$props.playing) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var button_2 = $.sibling(node, 2);
	var text = $.only_child(button_2);
	var input = $.sibling(button_2, 2);

	$.remove_input_defaults(input);
	$.set_attribute(input, 'min', 0);
	$.set_attribute(input, 'max', 1);
	$.set_attribute(input, 'step', 0.01);

	var div = $.sibling(input, 2);
	var text_1 = $.only_child(div, true);

	$.reset(menu);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, `x${$0 ?? ''}`);
			$.set_text(text_1, $1);
		},
		[() => rate().toFixed(1), () => fmt(position())]
	);

	$.delegated('click', button_2, () => toggleRate());
	$.bind_value(input, position);
	$.append($$anchor, menu);
	$.pop();
}

$.delegate(['click']);