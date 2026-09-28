import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="footer-content"><span> </span> <i class="wxi-check"></i> <style>.footer-content {
			display: flex;
			align-items: center;
			gap: 6px;
		}

		.footer-content i {
			display: inline-flex;
			font-size: 20px;
		}</style></div>`);

export default function FooterTextCell($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var span = $.child(div);
	var text = $.only_child(span, true);

	$.next(4);
	$.reset(div);
	$.template_effect(() => $.set_text(text, $$props.cell.text));
	$.append($$anchor, div);
	$.pop();
}