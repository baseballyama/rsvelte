import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import toast_ from '../lib';

var root = $.from_html(`<span>Custom and <b>bold</b> <button>Dismiss</button></span>`);

export default function RichContent($$anchor, $$props) {
	$.push($$props, true);

	var span = root();
	var text = $.sibling($.child(span), 2);
	var button = $.sibling(text);

	$.reset(span);
	$.template_effect(() => $.set_text(text, ` with props like ${$$props.someProp ?? ''}! `));
	$.delegated('click', button, () => toast_.dismiss($$props.toast.id));
	$.append($$anchor, span);
	$.pop();
}

$.delegate(['click']);