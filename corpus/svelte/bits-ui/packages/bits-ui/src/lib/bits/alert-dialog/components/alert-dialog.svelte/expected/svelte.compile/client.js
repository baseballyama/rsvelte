import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { noop } from "$lib/internal/noop.js";
import { DialogRootState } from "$lib/bits/dialog/dialog.svelte.js";

export default function Alert_dialog($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		onOpenChange = $.prop($$props, 'onOpenChange', 3, noop),
		onOpenChangeComplete = $.prop($$props, 'onOpenChangeComplete', 3, noop);

	DialogRootState.create({
		variant: boxWith(() => "alert-dialog"),
		open: boxWith(() => open(), (v) => {
			open(v);
			onOpenChange()(v);
		}),
		onOpenChangeComplete: boxWith(() => onOpenChangeComplete())
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}