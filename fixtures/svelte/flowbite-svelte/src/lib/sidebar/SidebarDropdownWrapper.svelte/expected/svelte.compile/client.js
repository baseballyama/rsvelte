import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { getSidebarContext } from "$lib/context";
import { writable } from "svelte/store";
import { slide } from "svelte/transition";
import { sidebarDropdownWrapper } from "./theme";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'arrowup',
	'arrowdown',
	'icon',
	'isOpen',
	'btnClass',
	'label',
	'spanClass',
	'ulClass',
	'transition',
	'params',
	'svgClass',
	'class',
	'classes',
	'onclick'
]);

var root = $.from_svg(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"></path></svg>`);
var root_1 = $.from_svg(`<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"></path></svg>`);
var root_2 = $.from_html(`<ul><!></ul>`);
var root_3 = $.from_html(`<li><button><!> <span> </span> <!></button> <!></li>`);

export default function SidebarDropdownWrapper($$anchor, $$props) {
	$.push($$props, true);

	const $selectedStore = () => $.store_get($.get(selectedStore), '$selectedStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let isOpen = $.prop($$props, 'isOpen', 15),
		transition = $.prop($$props, 'transition', 3, slide),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"SidebarDropdownWrapper",
		untrack(() => ({
			btnClass: $$props.btnClass,
			spanClass: $$props.spanClass,
			ulClass: $$props.ulClass,
			svgClass: $$props.svgClass
		})),
		{
			btnClass: "btn",
			spanClass: "span",
			ulClass: "ul",
			svgClass: "svg"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		btn: $$props.btnClass,
		span: $$props.spanClass,
		ul: $$props.ulClass,
		svg: $$props.svgClass
	});

	const theme = $.derived(() => getTheme("sidebarDropdownWrapper"));
	const { base, btn, span, svg, ul } = sidebarDropdownWrapper();
	const isControlled = $.derived(() => isOpen() !== undefined);
	let ctx = getSidebarContext() || { isSingle: false };
	let self = {};

	if (ctx.isSingle && !ctx.selected) {
		ctx.selected = writable(null);
	}

	const selectedStore = $.derived(() => ctx.selected);
	let localOpen = $.state(false);

	const openState = $.derived(() => $.get(isControlled)
		? isOpen()
		: ctx.isSingle ? $selectedStore() === self : $.get(localOpen));

	function handleDropdown() {
		if ($.get(isControlled)) {
			isOpen(!isOpen());
		} else if (ctx.isSingle) {
			ctx.selected.update((current) => current === self ? null : self);
		} else {
			$.set(localOpen, !$.get(localOpen));
		}

		if ($$props.onclick) $$props.onclick();
	}

	var li = root_3();
	var button = $.child(li);

	$.attribute_effect(
		button,
		($0) => ({
			...restProps,
			onclick: handleDropdown,
			type: 'button',
			class: $0,
			'aria-controls': 'sidebar-dropdown'
		}),
		[
			() => btn({ class: clsx($.get(theme)?.btn, $.get(styling).btn) })
		]
	);

	var node = $.child(button);

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

	var span_1 = $.sibling(node, 2);
	var text = $.only_child(span_1, true);
	var node_2 = $.sibling(span_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_4 = $.first_child(fragment_2);

					$.snippet(node_4, () => $$props.arrowup);
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var svg_1 = root();

					$.template_effect(($0) => $.set_class(svg_1, 0, $0), [
						() => $.clsx(svg({ class: clsx($.get(theme)?.svg, $.get(styling).svg) }))
					]);

					$.append($$anchor, svg_1);
				};

				$.if(node_3, ($$render) => {
					if ($$props.arrowup) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var consequent_3 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_5 = $.first_child(fragment_3);

			$.snippet(node_5, () => $$props.arrowdown);
			$.append($$anchor, fragment_3);
		};

		var alternate_1 = ($$anchor) => {
			var svg_2 = root_1();

			$.template_effect(($0) => $.set_class(svg_2, 0, $0), [
				() => $.clsx(svg({ class: clsx($.get(theme)?.svg, $.get(styling).svg) }))
			]);

			$.append($$anchor, svg_2);
		};

		$.if(node_2, ($$render) => {
			if ($.get(openState)) $$render(consequent_2); else if ($$props.arrowdown) $$render(consequent_3, 1); else $$render(alternate_1, -1);
		});
	}

	$.reset(button);

	var node_6 = $.sibling(button, 2);

	{
		var consequent_4 = ($$anchor) => {
			var ul_1 = root_2();
			var node_7 = $.child(ul_1);

			$.snippet(node_7, () => $$props.children);
			$.reset(ul_1);

			$.template_effect(($0) => $.set_class(ul_1, 1, $0), [
				() => $.clsx(ul({ class: clsx($.get(theme)?.ul, $.get(styling).ul) }))
			]);

			$.transition(3, ul_1, transition, () => $$props.params);
			$.append($$anchor, ul_1);
		};

		$.if(node_6, ($$render) => {
			if ($.get(openState)) $$render(consequent_4);
		});
	}

	$.reset(li);

	$.template_effect(
		($0, $1) => {
			$.set_class(li, 1, $0);
			$.set_class(span_1, 1, $1);
			$.set_text(text, $$props.label);
		},
		[
			() => $.clsx(base({ class: clsx($.get(theme)?.base, $$props.class) })),
			() => $.clsx(span({ class: clsx($.get(theme)?.span, $.get(styling).span) }))
		]
	);

	$.append($$anchor, li);
	$.pop();
	$$cleanup();
}