import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LoaderCircle from "$lib/icons/loader-circle.svelte";
import { resolveButtonClass, iconSizeStyles } from "./styles.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'buttonElement',
	'class',
	'shape',
	'size',
	'variant',
	'prefix',
	'suffix',
	'svgOnly',
	'shadow',
	'loading',
	'disabled',
	'type',
	'onclick',
	'children'
]);

var root = $.from_html(`<span aria-hidden="true"><!></span>`);
var root_1 = $.from_html(`<span><!></span>`);
var root_2 = $.from_html(`<span class="inline-flex items-center px-1.5"><!></span>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<button><!></button>`);

export default function Button($$anchor, $$props) {
	$.push($$props, true);

	let buttonElement = $.prop($$props, 'buttonElement', 15),
		shape = $.prop($$props, 'shape', 3, undefined),
		size = $.prop($$props, 'size', 3, "medium"),
		variant = $.prop($$props, 'variant', 3, "default"),
		prefix = $.prop($$props, 'prefix', 3, undefined),
		suffix = $.prop($$props, 'suffix', 3, undefined),
		svgOnly = $.prop($$props, 'svgOnly', 3, false),
		shadow = $.prop($$props, 'shadow', 3, false),
		loading = $.prop($$props, 'loading', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		type = $.prop($$props, 'type', 3, "button"),
		rest = $.rest_props($$props, rest_excludes);

	let iconSize = $.derived(() => iconSizeStyles[size()]);

	let buttonClass = $.derived(() => resolveButtonClass({
		size: size(),
		variant: variant(),
		shape: shape(),
		svgOnly: svgOnly(),
		shadow: shadow(),
		disabled: disabled(),
		loading: loading(),
		class: $$props.class
	}));

	let isInactive = $.derived(() => disabled() || loading());

	$.user_effect(() => {
		if (!import.meta.env.DEV || !svgOnly()) return;

		const labelled = rest["aria-label"] != null || rest["aria-labelledby"] != null;

		if (!labelled) {
			console.warn("Button: svgOnly requires aria-label or aria-labelledby");
		}
	});

	function handleClick(event) {
		if ($.get(isInactive)) {
			event.preventDefault();
			event.stopImmediatePropagation();

			return;
		}

		$$props.onclick?.(event);
	}

	var button = root_4();

	$.attribute_effect(button, () => ({
		...rest,
		type: type(),
		disabled: disabled() || undefined,
		'aria-disabled': $.get(isInactive) ? true : undefined,
		'aria-busy': loading() ? true : undefined,
		class: $.get(buttonClass),
		onclick: handleClick
	}));

	var node = $.child(button);

	{
		var consequent_2 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var span = root();
					var node_2 = $.child(span);

					LoaderCircle(node_2, {});
					$.reset(span);
					$.template_effect(() => $.set_class(span, 1, `${$.get(iconSize) ?? ''} flex animate-spin items-center justify-center`));
					$.append($$anchor, span);
				};

				var consequent_1 = ($$anchor) => {
					var span_1 = root_1();
					var node_3 = $.child(span_1);

					$.snippet(node_3, () => $$props.children);
					$.reset(span_1);
					$.template_effect(() => $.set_class(span_1, 1, `${$.get(iconSize) ?? ''} flex items-center justify-center`));
					$.append($$anchor, span_1);
				};

				$.if(node_1, ($$render) => {
					if (loading()) $$render(consequent); else if ($$props.children) $$render(consequent_1, 1);
				});
			}

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_3();
			var node_4 = $.first_child(fragment_1);

			{
				var consequent_3 = ($$anchor) => {
					var span_2 = root();
					var node_5 = $.child(span_2);

					LoaderCircle(node_5, {});
					$.reset(span_2);
					$.template_effect(() => $.set_class(span_2, 1, `${$.get(iconSize) ?? ''} flex animate-spin items-center justify-center`));
					$.append($$anchor, span_2);
				};

				var consequent_4 = ($$anchor) => {
					var span_3 = root_1();
					var node_6 = $.child(span_3);

					$.snippet(node_6, prefix);
					$.reset(span_3);
					$.template_effect(() => $.set_class(span_3, 1, `${$.get(iconSize) ?? ''} flex items-center justify-center`));
					$.append($$anchor, span_3);
				};

				$.if(node_4, ($$render) => {
					if (loading()) $$render(consequent_3); else if (prefix()) $$render(consequent_4, 1);
				});
			}

			var node_7 = $.sibling(node_4, 2);

			{
				var consequent_5 = ($$anchor) => {
					var span_4 = root_2();
					var node_8 = $.child(span_4);

					$.snippet(node_8, () => $$props.children);
					$.reset(span_4);
					$.append($$anchor, span_4);
				};

				$.if(node_7, ($$render) => {
					if ($$props.children) $$render(consequent_5);
				});
			}

			var node_9 = $.sibling(node_7, 2);

			{
				var consequent_6 = ($$anchor) => {
					var span_5 = root_1();
					var node_10 = $.child(span_5);

					$.snippet(node_10, suffix);
					$.reset(span_5);
					$.template_effect(() => $.set_class(span_5, 1, `${$.get(iconSize) ?? ''} flex items-center justify-center`));
					$.append($$anchor, span_5);
				};

				$.if(node_9, ($$render) => {
					if (!loading() && suffix()) $$render(consequent_6);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (svgOnly()) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.bind_this(button, ($$value) => buttonElement($$value), () => buttonElement());
	$.append($$anchor, button);
	$.pop();
}