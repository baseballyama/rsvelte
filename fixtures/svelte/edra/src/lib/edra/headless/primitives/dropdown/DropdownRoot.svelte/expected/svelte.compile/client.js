import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setDropdown } from './context.ts';

var root = $.from_html(`<div class="dropdown-root svelte-iwq79a"><!></div>`);

export default function DropdownRoot($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false);
	let triggerEl = $.state(null);
	let contentEl = $.state(null);

	const context = {
		get open() {
			return open();
		},

		set open(val) {
			open(val);
			$$props.onOpenChange?.(val);
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
		},

		close() {
			open(false);
			$$props.onOpenChange?.(false);
		},

		toggle() {
			open(!open());
			$$props.onOpenChange?.(open());
		},

		setTrigger(el) {
			$.set(triggerEl, el, true);
		},

		setContent(el) {
			$.set(contentEl, el, true);
		}
	};

	setDropdown(context);

	function handleOutsideClick(event) {
		if (!open()) return;

		const target = event.target;

		if ($.get(triggerEl) && !$.get(triggerEl).contains(target) && $.get(contentEl) && !$.get(contentEl).contains(target)) {
			open(false);
			$$props.onOpenChange?.(false);
		}
	}

	var div = root();

	$.event('click', $.document, handleOutsideClick);

	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}