import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toggle } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'pressed']);
var root = $.from_html(`<main><button data-testid="binding"> </button> <!></main>`);

export default function Toggle_test($$anchor, $$props) {
	let pressed = $.prop($$props, 'pressed', 7, false),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root();
	var button = $.child(main);
	var text = $.only_child(button, true);
	var node = $.sibling(button, 2);

	$.component(node, () => Toggle.Root, ($$anchor, Toggle_Root) => {
		Toggle_Root($$anchor, $.spread_props({ 'aria-label': 'toggle', 'data-testid': 'root' }, () => restProps, {
			get pressed() {
				return pressed();
			},

			set pressed($$value) {
				pressed($$value);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('a');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		}));
	});

	$.reset(main);
	$.template_effect(() => $.set_text(text, pressed()));
	$.delegated('click', button, () => pressed(!pressed()));
	$.append($$anchor, main);
}

$.delegate(['click']);