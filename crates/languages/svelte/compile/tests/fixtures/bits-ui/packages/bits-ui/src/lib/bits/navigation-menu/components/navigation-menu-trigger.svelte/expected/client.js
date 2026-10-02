import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { NavigationMenuTriggerState } from "../navigation-menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import VisuallyHidden from "$lib/bits/utilities/visually-hidden/visually-hidden.svelte";
import Mounted from "$lib/bits/utilities/mounted.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'disabled',
	'children',
	'child',
	'ref',
	'tabindex'
]);

var root = $.from_html(`<button><!></button>`);
var root_1 = $.from_html(`<span></span>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Navigation_menu_trigger($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		disabled = $.prop($$props, 'disabled', 3, false),
		ref = $.prop($$props, 'ref', 15, null),
		tabindex = $.prop($$props, 'tabindex', 3, 0),
		restProps = $.rest_props($$props, rest_excludes);

	const triggerState = NavigationMenuTriggerState.create({
		id: boxWith(() => id()),
		disabled: boxWith(() => disabled() ?? false),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, triggerState.props, { tabindex: tabindex() }));
	var fragment = root_3();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps) }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var button = root();

			$.attribute_effect(button, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(button);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(button);
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_3 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_2 = root_2();
			var node_4 = $.first_child(fragment_2);

			VisuallyHidden(node_4, $.spread_props(() => triggerState.focusProxyProps));

			var node_5 = $.sibling(node_4, 2);

			Mounted(node_5, {
				get mounted() {
					return triggerState.focusProxyMounted;
				},

				set mounted($$value) {
					triggerState.focusProxyMounted = $$value;
				}
			});

			var node_6 = $.sibling(node_5, 2);

			{
				var consequent_1 = ($$anchor) => {
					var span = root_1();

					$.template_effect(() => $.set_attribute(span, 'aria-owns', triggerState.itemContext.contentId ?? undefined));
					$.append($$anchor, span);
				};

				$.if(node_6, ($$render) => {
					if (triggerState.context.viewportRef.current) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node_3, ($$render) => {
			if (triggerState.open) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}