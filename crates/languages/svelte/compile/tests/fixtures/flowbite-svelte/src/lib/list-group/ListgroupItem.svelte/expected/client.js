import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { listGroupItem } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import { getListGroupContext } from "$lib/context";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'active',
	'current',
	'disabled',
	'horizontal',
	'name',
	'Icon',
	'class',
	'iconClass'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<li><!></li>`);
var root_2 = $.from_html(`<button><!></button>`);
var root_3 = $.from_html(`<a><!></a>`);

export default function ListgroupItem($$anchor, $$props) {
	$.push($$props, true);

	const nameOrChildren = ($$anchor) => {
		var fragment = root();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => clsx(iconClass()));

					$.component(node_1, () => $$props.Icon, ($$anchor, Icon_1) => {
						Icon_1($$anchor, {
							get class() {
								return $.get($0);
							}
						});
					});
				}

				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if ($$props.Icon) $$render(consequent);
			});
		}

		var node_2 = $.sibling(node, 2);

		{
			var consequent_1 = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				$.snippet(node_3, () => $$props.children);
				$.append($$anchor, fragment_2);
			};

			var alternate = ($$anchor) => {
				var text = $.text();

				$.template_effect(() => $.set_text(text, $$props.name));
				$.append($$anchor, text);
			};

			$.if(node_2, ($$render) => {
				if ($$props.children) $$render(consequent_1); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	let iconClass = $.prop($$props, 'iconClass', 3, "me-2.5 h-15 w-15"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("listGroupItem"));
	const listGroupCtx = getListGroupContext();
	const finalActive = $.derived(() => $$props.active ?? listGroupCtx?.active);
	const finalHorizontal = $.derived(() => $$props.horizontal ?? listGroupCtx?.horizontal);
	let state = $.derived(() => $$props.disabled ? "disabled" : $$props.current ? "current" : "normal");

	let itemClass = $.derived(() => listGroupItem({
		state: $.get(state),
		active: $.get(finalActive),
		horizontal: $.get(finalHorizontal),
		class: clsx($.get(theme), $$props.class)
	}));

	var fragment_4 = $.comment();
	var node_4 = $.first_child(fragment_4);

	{
		var consequent_2 = ($$anchor) => {
			var li = root_1();
			var node_5 = $.child(li);

			nameOrChildren(node_5);
			$.reset(li);
			$.template_effect(() => $.set_class(li, 1, $.clsx($.get(itemClass))));
			$.append($$anchor, li);
		};

		var consequent_3 = ($$anchor) => {
			var button = root_2();

			$.attribute_effect(button, () => ({
				type: 'button',
				...restProps,
				class: $.get(itemClass),
				disabled: $$props.disabled,
				'aria-current': $$props.current
			}));

			var node_6 = $.child(button);

			nameOrChildren(node_6);
			$.reset(button);
			$.append($$anchor, button);
		};

		var alternate_1 = ($$anchor) => {
			var a = root_3();

			$.attribute_effect(a, () => ({
				...restProps,
				class: $.get(itemClass),
				'aria-current': $$props.current
			}));

			var node_7 = $.child(a);

			nameOrChildren(node_7);
			$.reset(a);
			$.append($$anchor, a);
		};

		$.if(node_4, ($$render) => {
			if ($$props.href === undefined && !$$props.active) $$render(consequent_2); else if ($$props.href === undefined) $$render(consequent_3, 1); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment_4);
	$.pop();
}