import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scrollTo } from './GlobalOptionsList.svelte';

var root = $.from_html(`<sup><button class="svelte-19uzolc">?</button></sup>`);

export default function ScrollToButton($$anchor, $$props) {
	$.push($$props, true);

	var sup = root();
	var button = $.only_child(sup);

	$.template_effect(() => $.set_attribute(button, 'title', `See how to set the ${$$props.id ?? ''} option`));
	$.delegated('click', button, () => scrollTo(`#${$$props.id}`));
	$.append($$anchor, sup);
	$.pop();
}

$.delegate(['click']);