import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Alert_dialog_portal($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => AlertDialogPrimitive.Portal, ($$anchor, AlertDialogPrimitive_Portal) => {
		AlertDialogPrimitive_Portal($$anchor, $.spread_props(() => restProps));
	});

	$.append($$anchor, fragment);
}