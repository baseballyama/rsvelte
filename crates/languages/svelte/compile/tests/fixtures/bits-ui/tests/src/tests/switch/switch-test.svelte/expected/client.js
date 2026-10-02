import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Switch } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'checked']);
var root = $.from_html(`<main><button data-testid="binding"> </button> <!></main>`);

export default function Switch_test($$anchor, $$props) {
	let checked = $.prop($$props, 'checked', 7, false),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root();
	var button = $.child(main);
	var text = $.only_child(button, true);
	var node = $.sibling(button, 2);

	$.component(node, () => Switch.Root, ($$anchor, Switch_Root) => {
		Switch_Root($$anchor, $.spread_props({ 'aria-label': 'airplane mode', 'data-testid': 'root' }, () => restProps, {
			get checked() {
				return checked();
			},

			set checked($$value) {
				checked($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
					Switch_Thumb($$anchor, { 'data-testid': 'thumb' });
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	$.reset(main);
	$.template_effect(() => $.set_text(text, checked()));
	$.delegated('click', button, () => checked(!checked()));
	$.append($$anchor, main);
}

$.delegate(['click']);