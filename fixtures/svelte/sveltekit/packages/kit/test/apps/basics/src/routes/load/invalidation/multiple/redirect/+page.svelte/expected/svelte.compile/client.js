import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { refreshAll } from '$app/navigation';
import { redirect_state } from '../state';

var root = $.from_html(`<button class="redirect">redirect</button> <p class="redirect-state"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $redirect_state = () => $.store_get(redirect_state, '$redirect_state', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function redirect() {
		redirect_state.set('start');
		refreshAll();
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var p = $.sibling(button, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `Redirect state: ${$redirect_state() ?? ''}`));
	$.delegated('click', button, redirect);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);