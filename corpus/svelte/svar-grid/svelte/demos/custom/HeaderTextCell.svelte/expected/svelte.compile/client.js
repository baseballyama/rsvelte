import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "@svar-ui/svelte-core";

var root = $.from_html(`<div class="header-content"><!> <span>Custom header content</span> <style>.header-content {
			display: flex;
			align-items: center;
		}

		.header-content span {
			margin-left: 10px;
		}

		.header-content i {
			display: inline-flex;
			font-size: 20px;
		}</style></div>`);

export default function HeaderTextCell($$anchor) {
	var div = root();
	var node = $.child(div);

	Button(node, { type: "secondary", icon: 'wxi-alert' });
	$.next(4);
	$.reset(div);
	$.append($$anchor, div);
}