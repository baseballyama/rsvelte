import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CopyButton from './copy-button.svelte';
import ViewComponentButton from './view-component-button.svelte';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'componentData',
	'onShallowRouteClick',
	'ref'
]);

var root = $.from_html(`<div><!> <div class="bg-border h-6 w-px"></div> <!></div>`);
var root_1 = $.from_html(`<div><!> <div><!></div></div>`);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	const actionButtons = ($$anchor, $$arg0) => {
		let source = () => ($$arg0?.()).source;
		var div = root();
		var node = $.child(div);

		ViewComponentButton(node, {
			get onclick() {
				return $$props.onShallowRouteClick;
			}
		});

		var node_1 = $.sibling(node, 4);

		CopyButton(node_1, {
			get code() {
				return source();
			}
		});

		$.reset(div);

		$.template_effect(($0) => $.set_class(div, 1, $0), [
			() => $.clsx(cn('absolute top-2 right-2 flex items-center gap-x-2 rounded-lg'))
		]);

		$.append($$anchor, div);
	};

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var div_1 = root_1();

	$.attribute_effect(div_1, () => ({ ...restProps }));

	var node_2 = $.child(div_1);

	actionButtons(node_2, () => ({ source: $$props.componentData.code.raw.content }));

	var div_2 = $.sibling(node_2, 2);
	var node_3 = $.child(div_2);

	$.snippet(node_3, () => $$props.children ?? $.noop);
	$.reset(div_2);
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div_1);
	$.pop();
}