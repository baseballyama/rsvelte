import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from "svelte/transition";
import { banner } from "./theme";
import clsx from "clsx";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'header',
	'open',
	'dismissable',
	'closeAriaLabel',
	'color',
	'type',
	'class',
	'classes',
	'innerClass',
	'transition',
	'params',
	'closeClass',
	'onclose'
]);

var root = $.from_html(`<div class="flex items-center justify-end"><!></div>`);
var root_1 = $.from_html(`<div><div><!></div> <!></div>`);

export default function Banner($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, true),
		dismissable = $.prop($$props, 'dismissable', 3, true),
		closeAriaLabel = $.prop($$props, 'closeAriaLabel', 3, "Remove banner"),
		color = $.prop($$props, 'color', 3, "gray"),
		transition = $.prop($$props, 'transition', 3, fade),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Banner",
		untrack(() => ({
			innerClass: $$props.innerClass,
			closeClass: $$props.closeClass
		})),
		{ innerClass: "insideDiv", closeClass: "dismissable" }
	);

	const styling = $.derived(() => $$props.classes ?? {
		insideDiv: $$props.innerClass,
		dismissable: $$props.closeClass
	});

	// Theme context
	const theme = $.derived(() => getTheme("banner"));

	const $$d = $.derived(() => banner({ type: $$props.type, color: color() })),
		base = $.derived(() => $.get($$d).base),
		insideDiv = $.derived(() => $.get($$d).insideDiv),
		dismissableClass = $.derived(() => $.get($$d).dismissable);

	let ref = $.state(undefined);

	function close(event) {
		if ($.get(ref)?.dispatchEvent(new Event("close", { bubbles: true, cancelable: true }))) {
			open(false);
			$$props.onclose?.(event);
		}
	}

	createDismissableContext(close);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();

			$.attribute_effect(div, ($0) => ({ tabindex: '-1', class: $0, ...restProps }), [
				() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
			]);

			var div_1 = $.child(div);
			var node_1 = $.child(div_1);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(div_1);

			var node_2 = $.sibling(div_1, 2);

			{
				var consequent = ($$anchor) => {
					var div_2 = root();
					var node_3 = $.child(div_2);

					{
						let $0 = $.derived(() => $.get(dismissableClass)({
							class: clsx($.get(theme)?.dismissable, $.get(styling).dismissable)
						}));

						CloseButton(node_3, {
							get class() {
								return $.get($0);
							},

							get color() {
								return color();
							},

							get ariaLabel() {
								return closeAriaLabel();
							}
						});
					}

					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				$.if(node_2, ($$render) => {
					if (dismissable()) $$render(consequent);
				});
			}

			$.reset(div);
			$.bind_this(div, ($$value) => $.set(ref, $$value), () => $.get(ref));

			$.template_effect(($0) => $.set_class(div_1, 1, $0), [
				() => $.clsx($.get(insideDiv)({
					class: clsx($.get(theme)?.insideDiv, $.get(styling).insideDiv)
				}))
			]);

			$.transition(3, div, transition, () => $$props.params);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (open()) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}