import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Layout } from '@appwrite.io/pink-svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'expanded',
	'slotSpacing',
	'overlapCover',
	'paddingInlineEnd',
	'paddingInlineEndDouble',
	'insideSideSheet',
	'databasesScreen',
	'databasesMainScreen',
	'expandHeightButton',
	'size',
	'children'
]);

var root = $.from_html(`<div><div><!></div></div>`);

export default function Container($$anchor, $$props) {
	let expanded = $.prop($$props, 'expanded', 3, false),
		slotSpacing = $.prop($$props, 'slotSpacing', 3, false),
		overlapCover = $.prop($$props, 'overlapCover', 3, false),
		paddingInlineEnd = $.prop($$props, 'paddingInlineEnd', 3, true),
		paddingInlineEndDouble = $.prop($$props, 'paddingInlineEndDouble', 3, false),
		insideSideSheet = $.prop($$props, 'insideSideSheet', 3, false),
		databasesScreen = $.prop($$props, 'databasesScreen', 3, false),
		databasesMainScreen = $.prop($$props, 'databasesMainScreen', 3, false),
		expandHeightButton = $.prop($$props, 'expandHeightButton', 3, false),
		size = $.prop($$props, 'size', 3, null),
		restProps = $.rest_props($$props, rest_excludes);

	const style = $.derived(() => size()
		? `--p-container-max-size: var(--container-max-size, var(--container-size-${size()}))`
		: '');

	var div = root();

	$.attribute_effect(
		div,
		() => ({
			...restProps,
			[$.CLASS]: { 'overlap-cover': overlapCover() },
			[$.STYLE]: { 'container-type': 'inline-size' }
		}),
		void 0,
		void 0,
		void 0,
		'svelte-ucqum5'
	);

	var div_1 = $.child(div);
	let classes;
	var node = $.child(div_1);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 'l',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.snippet(node_1, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_style(div_1, $.get(style));

		classes = $.set_class(div_1, 1, 'console-container svelte-ucqum5', null, classes, {
			expanded: expanded(),
			slotSpacing: slotSpacing(),
			insideSideSheet: insideSideSheet(),
			databasesScreen: databasesScreen(),
			expandHeightButton: expandHeightButton(),
			databasesMainScreen: databasesMainScreen(),
			paddingInlineEndDouble: paddingInlineEndDouble(),
			paddingInlineEnd: !paddingInlineEnd()
		});
	});

	$.append($$anchor, div);
}