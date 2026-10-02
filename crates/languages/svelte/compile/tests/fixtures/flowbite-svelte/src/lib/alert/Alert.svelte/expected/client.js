import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from "svelte/transition";
import { alert } from "./theme";
import clsx from "clsx";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'icon',
	'alertStatus',
	'closeIcon',
	'closeAriaLabel',
	'color',
	'rounded',
	'border',
	'class',
	'dismissable',
	'transition',
	'params'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div><!> <!> <!></div>`);

export default function Alert($$anchor, $$props) {
	$.push($$props, true);

	let alertStatus = $.prop($$props, 'alertStatus', 15, true),
		closeAriaLabel = $.prop($$props, 'closeAriaLabel', 3, "Remove alert"),
		color = $.prop($$props, 'color', 3, "primary"),
		rounded = $.prop($$props, 'rounded', 3, true),
		transition = $.prop($$props, 'transition', 3, fade),
		restProps = $.rest_props($$props, rest_excludes);

	// Theme context
	const theme = $.derived(() => getTheme("alert"));

	let divCls = $.derived(() => alert({
		color: color(),
		rounded: rounded(),
		border: $$props.border,
		icon: !!$$props.icon,
		dismissable: $$props.dismissable,
		class: clsx($.get(theme), $$props.class)
	}));

	let ref = $.state(undefined);

	function close() {
		if ($.get(ref)?.dispatchEvent(new Event("close", { bubbles: true, cancelable: true }))) {
			alertStatus(false);
		}
	}

	createDismissableContext(close);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_4 = ($$anchor) => {
			var div = root_1();

			$.attribute_effect(div, () => ({ role: 'alert', ...restProps, class: $.get(divCls) }));

			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.snippet(node_2, () => $$props.icon);
					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if ($$props.icon) $$render(consequent);
				});
			}

			var node_3 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_1 = root();
					var node_4 = $.child(div_1);

					$.snippet(node_4, () => $$props.children);
					$.reset(div_1);
					$.append($$anchor, div_1);
				};

				var alternate = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_5 = $.first_child(fragment_2);

					$.snippet(node_5, () => $$props.children);
					$.append($$anchor, fragment_2);
				};

				$.if(node_3, ($$render) => {
					if ($$props.icon || $$props.dismissable) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			var node_6 = $.sibling(node_3, 2);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_7 = $.first_child(fragment_3);

					{
						var consequent_2 = ($$anchor) => {
							CloseButton($$anchor, {
								class: '-my-1.5 ms-auto -me-1.5',
								get color() {
									return color();
								},

								get ariaLabel() {
									return closeAriaLabel();
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_8 = $.first_child(fragment_5);

									$.component(node_8, () => $$props.closeIcon, ($$anchor, CloseIcon_1) => {
										CloseIcon_1($$anchor, {});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						};

						var alternate_1 = ($$anchor) => {
							CloseButton($$anchor, {
								class: '-my-1.5 ms-auto -me-1.5',
								get color() {
									return color();
								},

								get ariaLabel() {
									return closeAriaLabel();
								}
							});
						};

						$.if(node_7, ($$render) => {
							if ($$props.closeIcon) $$render(consequent_2); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_3);
				};

				$.if(node_6, ($$render) => {
					if ($$props.dismissable) $$render(consequent_3);
				});
			}

			$.reset(div);
			$.bind_this(div, ($$value) => $.set(ref, $$value), () => $.get(ref));
			$.transition(3, div, transition, () => $$props.params);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (alertStatus()) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}