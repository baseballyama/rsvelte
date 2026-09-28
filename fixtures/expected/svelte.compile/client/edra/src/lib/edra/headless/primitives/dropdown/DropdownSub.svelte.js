import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';

var root = $.from_html(`<div class="dropdown-sub svelte-15vxruo"><!></div>`);

export default function DropdownSub($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	let triggerEl = $.state(null);
	let contentEl = $.state(null);

	const subContext = {
		get open() {
			return $.get(open);
		},

		set open(val) {
			$.set(open, val, true);
		},

		get triggerEl() {
			return $.get(triggerEl);
		},

		set triggerEl(val) {
			$.set(triggerEl, val, true);
		},

		get contentEl() {
			return $.get(contentEl);
		},

		set contentEl(val) {
			$.set(contentEl, val, true);
		}
	};

	setContext('edra-dropdown-sub', subContext);

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}