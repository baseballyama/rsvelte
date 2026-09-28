import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { untrack } from "svelte";

import {
	NavigationMenuItemContext,
	NavigationMenuItemState,
	NavigationMenuContentImplState
} from "../navigation-menu.svelte.js";

import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";
import DismissibleLayer from "$lib/bits/utilities/dismissible-layer/dismissible-layer.svelte";
import EscapeLayer from "$lib/bits/utilities/escape-layer/escape-layer.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'id',
	'child',
	'children',
	'onInteractOutside',
	'onFocusOutside',
	'onEscapeKeydown',
	'escapeKeydownBehavior',
	'interactOutsideBehavior',
	'itemState',
	'onRefChange'
]);

var root = $.from_html(`<div><!></div>`);

export default function Navigation_menu_content_impl($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		onInteractOutside = $.prop($$props, 'onInteractOutside', 3, noop),
		onFocusOutside = $.prop($$props, 'onFocusOutside', 3, noop),
		onEscapeKeydown = $.prop($$props, 'onEscapeKeydown', 3, noop),
		escapeKeydownBehavior = $.prop($$props, 'escapeKeydownBehavior', 3, "close"),
		interactOutsideBehavior = $.prop($$props, 'interactOutsideBehavior', 3, "close"),
		restProps = $.rest_props($$props, rest_excludes);

	const contentImplState = NavigationMenuContentImplState.create(
		{
			id: boxWith(() => id()),
			ref: boxWith(() => ref(), (v) => {
				ref(v);
				untrack(() => $$props.onRefChange?.(v));
			})
		},
		$$props.itemState
	);

	if ($$props.itemState) {
		NavigationMenuItemContext.set($$props.itemState);
	}

	const mergedProps = $.derived(() => mergeProps(restProps, contentImplState.props));

	{
		const children = ($$anchor, $$arg0) => {
			let dismissibleProps = () => ($$arg0?.()).props;

			EscapeLayer($$anchor, {
				enabled: true,
				get ref() {
					return contentImplState.opts.ref;
				},

				onEscapeKeydown: (e) => {
					onEscapeKeydown()(e);

					if (e.defaultPrevented) return;

					contentImplState.onEscapeKeydown(e);
				},

				get escapeKeydownBehavior() {
					return escapeKeydownBehavior();
				},

				children: ($$anchor, $$slotProps) => {
					const finalProps = $.derived(() => mergeProps($.get(mergedProps), dismissibleProps()));
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							$.snippet(node_1, () => $$props.child, () => ({ props: $.get(finalProps) }));
							$.append($$anchor, fragment_3);
						};

						var alternate = ($$anchor) => {
							var div = root();

							$.attribute_effect(div, () => ({ ...$.get(finalProps) }));

							var node_2 = $.child(div);

							$.snippet(node_2, () => $$props.children ?? $.noop);
							$.reset(div);
							$.append($$anchor, div);
						};

						$.if(node, ($$render) => {
							if ($$props.child) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		DismissibleLayer($$anchor, {
			get id() {
				return id();
			},

			get ref() {
				return contentImplState.opts.ref;
			},
			enabled: true,
			onInteractOutside: (e) => {
				onInteractOutside()(e);

				if (e.defaultPrevented) return;

				contentImplState.onInteractOutside(e);
			},

			onFocusOutside: (e) => {
				onFocusOutside()(e);

				if (e.defaultPrevented) return;

				contentImplState.onFocusOutside(e);
			},

			get interactOutsideBehavior() {
				return interactOutsideBehavior();
			},
			children,
			$$slots: { default: true }
		});
	}

	$.pop();
}