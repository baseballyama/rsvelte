import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { preferences } from './preferences.svelte';

var root = $.from_html(`<div class="reset-preferences"><span>Use default settings</span> <button class="svelte-1knw26i">Reset</button></div>`);

export default function Reset($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var button = $.sibling($.child(div), 2);

	$.reset(div);
	$.delegated('click', button, () => preferences.reset());
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);