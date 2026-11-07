import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { echo } from './form.remote';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// a key with a space forces the encoded (server) and raw (client) id conventions to diverge
		const keyed = echo.for('a b');

		// a key with a slash must not break the `?/remote=` id parsing on the server
		const keyed_slash = echo.for('a/b');

		let hydrated = false;

		onMount(() => {
			hydrated = true;
		});

		$$renderer.push(`<div id="hydrated">${$.escape(hydrated)}</div> <div id="result">${$.escape(echo.result ?? 'none')}</div> <div id="issue">${$.escape(echo.fields.message.issues()?.[0]?.message ?? 'no issues')}</div> <div id="keyed-result">${$.escape(keyed.result ?? 'none')}</div> <div id="keyed-slash-result">${$.escape(keyed_slash.result ?? 'none')}</div> <form id="plain"${$.attr('action', echo.action)} method="POST"><input${$.attributes({ ...echo.fields.message.as('text') }, void 0, void 0, void 0, 4)}/> <button type="submit">Submit</button></form> <form id="keyed"${$.attr('action', keyed.action)} method="POST"><input${$.attributes({ ...keyed.fields.message.as('text') }, void 0, void 0, void 0, 4)}/> <button type="submit">Submit</button></form> <form id="keyed-slash"${$.attr('action', keyed_slash.action)} method="POST"><input${$.attributes({ ...keyed_slash.fields.message.as('text') }, void 0, void 0, void 0, 4)}/> <button type="submit">Submit</button></form>`);
	});
}