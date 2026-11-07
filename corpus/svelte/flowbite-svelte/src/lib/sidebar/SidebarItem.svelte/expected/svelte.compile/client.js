import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getSidebarContext, getActiveUrlContext } from "$lib/context";
import clsx from "clsx";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'icon',
	'subtext',
	'href',
	'label',
	'spanClass',
	'activeClass',
	'nonActiveClass',
	'aClass',
	'active',
	'class'
]);

var root = $.from_html(`<li><a><!> <span> </span> <!></a></li>`);

export default function SidebarItem($$anchor, $$props) {
	$.push($$props, true);

	let spanClass = $.prop($$props, 'spanClass', 3, "ms-3"),
		restProps = $.rest_props($$props, rest_excludes);

	const context = getSidebarContext() ?? {
		closeSidebar: undefined,
		activeClass: undefined,
		nonActiveClass: undefined
	};

	const activeUrl = getActiveUrlContext();

	let activeItem = $.derived(() => $$props.active !== undefined
		? $$props.active
		: activeUrl?.value ? $$props.href === activeUrl.value : false);

	let aCls = $.derived(() => $.get(activeItem)
		? $$props.activeClass ?? context.activeClass
		: $$props.nonActiveClass ?? context.nonActiveClass);

	var li = root();
	var a = $.child(li);

	$.attribute_effect(
		a,
		($0) => ({
			onclick: context.closeSidebar ?? undefined,
			...restProps,
			href: $$props.href,
			'aria-current': $.get(activeItem) ? "page" : undefined,
			class: $0
		}),
		[() => clsx($.get(aCls), $$props.aClass)]
	);

	var node = $.child(a);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.icon);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.icon) $$render(consequent);
		});
	}

	var span = $.sibling(node, 2);
	var text = $.only_child(span, true);
	var node_2 = $.sibling(span, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			$.snippet(node_3, () => $$props.subtext);
			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if ($$props.subtext) $$render(consequent_1);
		});
	}

	$.reset(a);
	$.reset(li);

	$.template_effect(
		($0, $1) => {
			$.set_class(li, 1, $0);
			$.set_class(span, 1, $1);
			$.set_text(text, $$props.label);
		},
		[
			() => $.clsx(clsx($$props.class)),
			() => $.clsx(clsx(spanClass()))
		]
	);

	$.append($$anchor, li);
	$.pop();
}