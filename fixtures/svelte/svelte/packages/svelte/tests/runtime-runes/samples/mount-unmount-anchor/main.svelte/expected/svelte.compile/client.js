import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mount, unmount } from "svelte";
import Component from "./Component.svelte";

var root = $.from_html(`<button>generate</button> <div></div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let target;

	function generate() {
		for (let i = 0; i < 1000; i++) {
			let myInnocentState = $.proxy({ text: "hello" });
			const toUnmount = mount(Component, { target, props: myInnocentState });

			unmount(toUnmount);
		}
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var div = $.sibling(button, 2);

	$.bind_this(div, ($$value) => target = $$value, () => target);
	$.delegated('click', button, generate);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);