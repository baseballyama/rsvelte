import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meter } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value']);
var root = $.from_html(`<main><!> <button data-testid="binding"> </button></main>`);

export default function Meter_test($$anchor, $$props) {
	let value = $.prop($$props, 'value', 7, 0),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root();
	var node = $.child(main);

	$.component(node, () => Meter.Root, ($$anchor, Meter_Root) => {
		Meter_Root($$anchor, $.spread_props(
			{
				'aria-label': 'battery remaining',
				'data-testid': 'root',
				get value() {
					return value();
				}
			},
			() => restProps
		));
	});

	var button = $.sibling(node, 2);
	var text = $.only_child(button, true);

	$.reset(main);
	$.template_effect(() => $.set_text(text, value()));
	$.delegated('click', button, () => value(50));
	$.append($$anchor, main);
}

$.delegate(['click']);