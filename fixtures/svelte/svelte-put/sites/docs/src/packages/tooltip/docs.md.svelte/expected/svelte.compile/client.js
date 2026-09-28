import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Docs_md($$anchor) {
	$.next();

	var text = $.text('## Deprecation Notice\n\nThis package has been dropped in favor of [@svelte-put/popover](/docs/popover). `@svelte-put/popover` is a more generic implementation that relies on [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API), which has landed in baseline in 2024 and provides better fallback for progressive enhancement in case Javascript is not available.\n\n---\n\nHappy migrating 😅');

	$.append($$anchor, text);
}