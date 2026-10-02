import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, setContext } from "svelte";
import { locale } from "@svar-ui/lib-dom";
import { en } from "@svar-ui/core-locales";

export default function Locale($$anchor, $$props) {
	$.push($$props, true);

	let words = $.prop($$props, 'words', 3, null),
		optional = $.prop($$props, 'optional', 3, false);

	let l = getContext("wx-i18n");

	if (!l || words() !== null) {
		if (!l) {
			l = locale(en);
		}

		l = l.extend(words(), optional());
		setContext("wx-i18n", l);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}