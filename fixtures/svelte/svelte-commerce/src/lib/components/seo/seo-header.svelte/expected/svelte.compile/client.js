import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SeoHeader as CoreSeoHeader } from '$lib/core/components/index.js';
import { page } from '$app/state';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Seo_header($$anchor, $$props) {
	$.push($$props, true);

	// The vendored SeoHeader declares `image = ''` with no fallback, so every call site that omits
	// it — and most did — shipped an empty og:image/twitter:image. Links to those pages render as
	// a bare grey card on every social network and chat app. Defaulting here fixes the whole app at
	// once, including call sites added later, instead of repeating the fallback at each one.
	// Explicit `image` props still win; the `||` only fills in empty strings and nullish values.
	const props = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => $$props.image || page.data?.store?.logo || '');

		CoreSeoHeader($$anchor, $.spread_props(() => props, {
			get image() {
				return $.get($0);
			}
		}));
	}

	$.pop();
}