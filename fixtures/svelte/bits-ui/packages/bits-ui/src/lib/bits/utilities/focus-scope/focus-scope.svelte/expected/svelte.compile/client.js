import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { noop } from "$lib/internal/noop.js";
import { FocusScope } from "./focus-scope.svelte.js";

export default function Focus_scope($$anchor, $$props) {
	$.push($$props, true);

	let enabled = $.prop($$props, 'enabled', 3, false),
		trapFocus = $.prop($$props, 'trapFocus', 3, false),
		loop = $.prop($$props, 'loop', 3, false),
		onCloseAutoFocus = $.prop($$props, 'onCloseAutoFocus', 3, noop),
		onOpenAutoFocus = $.prop($$props, 'onOpenAutoFocus', 3, noop);

	const focusScopeState = FocusScope.use({
		enabled: boxWith(() => enabled()),
		trap: boxWith(() => trapFocus()),
		loop: loop(),
		onCloseAutoFocus: boxWith(() => onCloseAutoFocus()),
		onOpenAutoFocus: boxWith(() => onOpenAutoFocus()),
		ref: $$props.ref
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.focusScope ?? $.noop, () => ({ props: focusScopeState.props }));
	$.append($$anchor, fragment);
	$.pop();
}