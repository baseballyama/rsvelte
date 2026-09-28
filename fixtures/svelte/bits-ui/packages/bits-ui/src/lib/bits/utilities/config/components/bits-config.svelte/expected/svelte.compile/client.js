import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useBitsConfig } from "../bits-config.js";
import { boxWith } from "svelte-toolbelt";

export default function Bits_config($$anchor, $$props) {
	$.push($$props, true);

	useBitsConfig({
		defaultPortalTo: boxWith(() => $$props.defaultPortalTo),
		defaultLocale: boxWith(() => $$props.defaultLocale)
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}