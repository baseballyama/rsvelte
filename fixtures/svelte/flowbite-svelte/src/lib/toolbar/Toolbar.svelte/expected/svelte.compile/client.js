import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { setToolbarContext } from "$lib/context";
import { toolbar } from "./theme";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'end',
	'color',
	'embedded',
	'class',
	'classes'
]);

var root = $.from_html(`<div><div><!></div> <!></div>`);

export default function Toolbar($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("toolbar"));
	const context = $.proxy({ separators: false });

	// Create context object with getter
	const ctx = {
		get separators() {
			return context.separators;
		},

		set separators(value) {
			context.separators = value;
		}
	};

	// Set context during initialization
	setToolbarContext(ctx);

	let frameColor = $.derived(() => $$props.embedded ? "default" : $$props.color);

	let $$d = $.derived(() => toolbar({
			color: $.get(frameColor),
			embedded: $$props.embedded,
			separators: context.separators
		})),
		base = $.derived(() => $.get($$d).base),
		content = $.derived(() => $.get($$d).content);

	var // let separatorsClass: string = twMerge($separators && 'sm:divide-x rtl:divide-x-reverse');
	// let divClass: string = twMerge('flex justify-between items-center', !embedded && 'py-2 px-3', className);
	div = root();

	$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [
		() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.snippet(node_2, () => $$props.end);
			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if ($$props.end) $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(($0) => $.set_class(div_1, 1, $0), [
		() => $.clsx($.get(content)({ class: clsx($.get(theme)?.content, $$props.classes?.content) }))
	]);

	$.append($$anchor, div);
	$.pop();
}