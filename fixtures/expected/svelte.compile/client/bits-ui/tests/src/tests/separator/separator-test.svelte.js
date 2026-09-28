import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Separator } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<main><!></main>`);

export default function Separator_test($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var main = root();
	var node = $.child(main);

	$.component(node, () => Separator.Root, ($$anchor, Separator_Root) => {
		Separator_Root($$anchor, $.spread_props({ 'data-testid': 'root' }, () => restProps));
	});

	$.reset(main);
	$.append($$anchor, main);
}