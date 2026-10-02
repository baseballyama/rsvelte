import * as $ from 'svelte/internal/server';
import { getContext, setContext } from "svelte";
import { locale } from "@svar-ui/lib-dom";
import { en } from "@svar-ui/core-locales";

export default function Locale($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { words = null, optional = false, children } = $$props;
		let l = getContext("wx-i18n");

		if (!l || words !== null) {
			if (!l) {
				l = locale(en);
			}

			l = l.extend(words, optional);
			setContext("wx-i18n", l);
		}

		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}