import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { MenubarContentState } from "../menubar.svelte.js";
import MenuContent from "$lib/bits/menu/components/menu-content.svelte";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'interactOutsideBehavior',
	'id',
	'onInteractOutside',
	'onFocusOutside',
	'onCloseAutoFocus',
	'onOpenAutoFocus'
]);

export default function Menubar_content($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		interactOutsideBehavior = $.prop($$props, 'interactOutsideBehavior', 3, "close"),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		onInteractOutside = $.prop($$props, 'onInteractOutside', 3, noop),
		onFocusOutside = $.prop($$props, 'onFocusOutside', 3, noop),
		onCloseAutoFocus = $.prop($$props, 'onCloseAutoFocus', 3, noop),
		onOpenAutoFocus = $.prop($$props, 'onOpenAutoFocus', 3, noop),
		restProps = $.rest_props($$props, rest_excludes);

	const contentState = MenubarContentState.create({
		id: boxWith(() => id()),
		interactOutsideBehavior: boxWith(() => interactOutsideBehavior()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		onInteractOutside: boxWith(() => onInteractOutside()),
		onFocusOutside: boxWith(() => onFocusOutside()),
		onCloseAutoFocus: boxWith(() => onCloseAutoFocus()),
		onOpenAutoFocus: boxWith(() => onOpenAutoFocus())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));

	MenuContent($$anchor, $.spread_props(() => $.get(mergedProps), () => contentState.popperProps, {
		preventScroll: false,
		get ref() {
			return ref();
		},

		set ref($$value) {
			ref($$value);
		}
	}));

	$.pop();
}