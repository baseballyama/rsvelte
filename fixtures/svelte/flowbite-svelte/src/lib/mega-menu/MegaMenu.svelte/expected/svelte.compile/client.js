import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { megamenu } from "./theme";
import clsx from "clsx";
import Popper from "$lib/utils/Popper.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'extra',
	'items',
	'full',
	'ulClass',
	'isOpen',
	'class',
	'extraClass',
	'classes'
]);

var root = $.from_html(`<li><!></li>`);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<div><ul></ul> <!></div>`);

export default function MegaMenu($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => []),
		isOpen = $.prop($$props, 'isOpen', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("MegaMenu", untrack(() => ({ ulClass: $$props.ulClass, extraClass: $$props.extraClass })), { ulClass: "ul", extraClass: "extra" });

	const styling = $.derived(() => $$props.classes ?? { ul: $$props.ulClass, extra: $$props.extraClass });
	const theme = $.derived(() => getTheme("megamenu"));

	const $$d = $.derived(() => megamenu({ full: $$props.full, hasExtra: !!$$props.extra })),
		base = $.derived(() => $.get($$d).base),
		div = $.derived(() => $.get($$d).div),
		ul = $.derived(() => $.get($$d).ul),
		extraCls = $.derived(() => $.get($$d).extra);

	{
		let $0 = $.derived(() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) }));

		Popper($$anchor, $.spread_props(
			{
				arrow: false,
				trigger: 'click',
				placement: 'bottom',
				get yOnly() {
					return $$props.full;
				}
			},
			() => restProps,
			{
				get class() {
					return $.get($0);
				},

				get isOpen() {
					return isOpen();
				},

				set isOpen($$value) {
					isOpen($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var div_1 = root_2();
					var ul_1 = $.child(div_1);

					$.each(
						ul_1,
						23,
						items,
						(item) => item.name,
						($$anchor, item, index) => {
							var li = root();
							var node = $.child(li);

							$.snippet(node, () => $$props.children, () => ({ item: $.get(item), index: $.get(index) }));
							$.reset(li);
							$.append($$anchor, li);
						},
						($$anchor) => {
							var fragment_1 = $.comment();
							var node_1 = $.first_child(fragment_1);

							$.snippet(node_1, () => $$props.children, () => ({ item: items()[0], index: 0 }));
							$.append($$anchor, fragment_1);
						}
					);

					$.reset(ul_1);

					var node_2 = $.sibling(ul_1, 2);

					{
						var consequent = ($$anchor) => {
							var div_2 = root_1();
							var node_3 = $.child(div_2);

							$.snippet(node_3, () => $$props.extra);
							$.reset(div_2);

							$.template_effect(($0) => $.set_class(div_2, 1, $0), [
								() => $.clsx($.get(extraCls)({ class: clsx($.get(theme)?.extra, $.get(styling).extra) }))
							]);

							$.append($$anchor, div_2);
						};

						$.if(node_2, ($$render) => {
							if ($$props.full && $$props.extra) $$render(consequent);
						});
					}

					$.reset(div_1);

					$.template_effect(
						($0, $1) => {
							$.set_class(div_1, 1, $0);
							$.set_class(ul_1, 1, $1);
						},
						[
							() => $.clsx($.get(div)({ class: clsx($.get(theme)?.div, $$props.classes?.div) })),
							() => $.clsx($.get(ul)({ class: clsx($.get(theme)?.ul, $.get(styling).ul) }))
						]
					);

					$.delegated('click', div_1, () => isOpen(false));
					$.delegated('keydown', div_1, (e) => e.key === "Enter" && isOpen(false));
					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}

$.delegate(['click', 'keydown']);