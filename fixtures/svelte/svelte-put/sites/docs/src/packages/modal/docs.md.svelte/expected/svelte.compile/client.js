import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SettingsContext } from '$lib/settings/context.svelte';

export default function Docs_md($$anchor, $$props) {
	$.push($$props, true);

	const settings = SettingsContext.get();

	$.next();

	var text = $.text('## Deprecation Notice\n\nThis package has been dropped in favor of [@svelte-put/async-stack](/docs/async-stack). `@svelte-put/async-stack` is a generic implementation inspired by `@svelte-put/modal` and `@svelte-put/noti`, and now is more minimal, unopinionated, and powerful thanks to Svelte runes.\n\nFollow patterns introduced in the `async-stack` ["Recipes" section](/docs/async-stack#modal--dialog) to migrate your existing `@svelte-put/modal` system to `@svelte-put/async-stack`.\n\nTo see the original documentation, [visit here](https://02e439f1.svelte-put.pages.dev/docs/modal).\n\n---\n\n\nHappy migrating 😅');

	$.append($$anchor, text);
	$.pop();
}