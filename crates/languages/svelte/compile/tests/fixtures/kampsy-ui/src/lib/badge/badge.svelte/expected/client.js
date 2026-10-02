import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolveBadgeClass, iconSizeStyles, iconGapStyles } from "./styles.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'href',
	'target',
	'rel',
	'download',
	'class',
	'variant',
	'contrast',
	'size',
	'icon',
	'children'
]);

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<a><span><!> <!></span></a>`);
var root_2 = $.from_html(`<span><span><!> <!></span></span>`);

export default function Badge($$anchor, $$props) {
	$.push($$props, true);

	const iconSnip = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				const Icon = $.derived(icon);
				var span = root();
				var node_1 = $.child(span);

				$.component(node_1, () => $.get(Icon), ($$anchor, Icon_1) => {
					Icon_1($$anchor, {});
				});

				$.reset(span);
				$.template_effect(() => $.set_class(span, 1, `flex items-center justify-center ${$.get(iconSizeClass) ?? ''}`));
				$.append($$anchor, span);
			};

			$.if(node, ($$render) => {
				if (icon()) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	};

	let href = $.prop($$props, 'href', 3, undefined),
		target = $.prop($$props, 'target', 3, undefined),
		rel = $.prop($$props, 'rel', 3, undefined),
		download = $.prop($$props, 'download', 3, undefined),
		variant = $.prop($$props, 'variant', 3, "gray"),
		contrast = $.prop($$props, 'contrast', 3, "high"),
		size = $.prop($$props, 'size', 3, "md"),
		icon = $.prop($$props, 'icon', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	let badgeClass = $.derived(() => resolveBadgeClass({
		variant: variant(),
		contrast: contrast(),
		size: size(),
		class: $$props.class
	}));

	let iconSizeClass = $.derived(() => iconSizeStyles[size()]);
	let iconGap = $.derived(() => iconGapStyles[size()]);
	var fragment_1 = $.comment();
	var node_2 = $.first_child(fragment_1);

	{
		var consequent_1 = ($$anchor) => {
			var a = root_1();

			$.attribute_effect(a, () => ({
				href: href(),
				target: target(),
				rel: rel(),
				download: download(),
				class: $.get(badgeClass),
				...rest
			}));

			var span_1 = $.child(a);
			var node_3 = $.child(span_1);

			iconSnip(node_3);

			var node_4 = $.sibling(node_3, 2);

			$.snippet(node_4, () => $$props.children ?? $.noop);
			$.reset(span_1);
			$.reset(a);
			$.template_effect(() => $.set_class(span_1, 1, `flex items-center ${$.get(iconGap) ?? ''}`));
			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var span_2 = root_2();

			$.attribute_effect(span_2, () => ({ class: $.get(badgeClass), ...rest }));

			var span_3 = $.child(span_2);
			var node_5 = $.child(span_3);

			iconSnip(node_5);

			var node_6 = $.sibling(node_5, 2);

			$.snippet(node_6, () => $$props.children ?? $.noop);
			$.reset(span_3);
			$.reset(span_2);
			$.template_effect(() => $.set_class(span_3, 1, `flex items-center ${$.get(iconGap) ?? ''}`));
			$.append($$anchor, span_2);
		};

		$.if(node_2, ($$render) => {
			if (href()) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
}