import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'value',
	'class',
	'size',
	'children'
]);

var root = $.from_html(`<div data-slot="native-select-wrapper"><select><!></select> <!></div>`);

export default function Native_select($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		size = $.prop($$props, 'size', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();
	var select = $.child(div);

	$.attribute_effect(select, () => ({
		'data-slot': 'native-select',
		'data-size': size(),
		class: 'cn-native-select outline-none disabled:pointer-events-none disabled:cursor-not-allowed',
		...restProps
	}));

	$.customizable_select(select, () => {
		var anchor = $.child(select);
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.snippet(node, () => $$props.children ?? $.noop);
		$.append(anchor, fragment);
	});

	$.bind_this(select, ($$value) => ref($$value), () => ref());

	var node_1 = $.sibling(select, 2);

	IconPlaceholder(node_1, {
		lucide: 'ChevronDownIcon',
		tabler: 'IconSelector',
		hugeicons: 'UnfoldMoreIcon',
		phosphor: 'CaretDownIcon',
		remixicon: 'RiArrowDownSLine',
		class: 'cn-native-select-icon pointer-events-none absolute select-none',
		'aria-hidden': true,
		'data-slot': 'native-select-icon'
	});

	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, $0);
			$.set_attribute(div, 'data-size', size());
		},
		[
			() => $.clsx(cn("cn-native-select-wrapper group/native-select relative w-fit has-[select:disabled]:opacity-50", $$props.class))
		]
	);

	$.bind_select_value(select, value);
	$.append($$anchor, div);
	$.pop();
}