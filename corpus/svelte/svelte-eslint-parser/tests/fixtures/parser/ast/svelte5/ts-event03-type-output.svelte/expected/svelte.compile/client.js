import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <input/>`, 1);

export default function Ts_event03_type_output($$anchor, $$props) {
	$.push($$props, true);

	// onfoo: (e: { detail: number; }) => void, onfoo: (e: { detail: number; }) => void
	// onfoo: (e: { detail: number; }) => void, e: { detail: number; }
	// $props(): { onfoo: (e: { detail: number; }) => void; }
	$$props.onfoo({ detail: 1 }); // onfoo({detail: 1}): void

	var fragment = root();
	var button = $.first_child(fragment);

	var // e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }
	// e.currentTarget: EventTarget & HTMLButtonElement
	input = $.sibling(button, 2);

	$.delegated('click', button, (e) => {
		// e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement; }
		e.currentTarget; // e.currentTarget: EventTarget & HTMLButtonElement
	});

	$.delegated('input', input, (e) => {
		// e: Event & { currentTarget: EventTarget & HTMLInputElement; }
		e.currentTarget; // e.currentTarget: EventTarget & HTMLInputElement
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'input']);