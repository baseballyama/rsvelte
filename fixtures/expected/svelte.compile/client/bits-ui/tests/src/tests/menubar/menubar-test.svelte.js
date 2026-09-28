import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Menubar } from "bits-ui";
import MenubarMenu from "./menubar-menu-test.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'one',
	'two',
	'three',
	'four'
]);

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<main><button data-testid="previous-button">previous button</button> <!> <button data-testid="next-button">next button</button></main>`);

export default function Menubar_test($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var main = root_1();
	var node = $.sibling($.child(main), 2);

	$.component(node, () => Menubar.Root, ($$anchor, Menubar_Root) => {
		Menubar_Root($$anchor, $.spread_props(() => restProps, {
			'data-testid': 'root',
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				MenubarMenu(node_1, $.spread_props({ id: '1' }, () => $$props.one));

				var node_2 = $.sibling(node_1, 2);

				MenubarMenu(node_2, $.spread_props({ id: '2' }, () => $$props.two));

				var node_3 = $.sibling(node_2, 2);

				MenubarMenu(node_3, $.spread_props({ id: '3' }, () => $$props.three));

				var node_4 = $.sibling(node_3, 2);

				MenubarMenu(node_4, $.spread_props({ id: '4' }, () => $$props.four));
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	$.next(2);
	$.reset(main);
	$.append($$anchor, main);
}