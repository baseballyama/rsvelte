import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Search, Button } from "flowbite-svelte";
import { MicrophoneSolid, SearchOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<button type="button" class="outline-hidden"><!></button>`);
var root_1 = $.from_html(`<!> Search`, 1);
var root_2 = $.from_html(`<form class="flex gap-2"><!> <!></form>`);

export default function Voice($$anchor) {
	function handleVoiceBtn() {
		alert("You clicked voice button");
	}

	var form = root_2();
	var node = $.child(form);

	Search(node, {
		size: 'lg',
		classes: { input: "flex items-center gap-2" },
		placeholder: 'Search Mockups, Logos, Design Templates...',
		children: ($$anchor, $$slotProps) => {
			var button = root();
			var node_1 = $.child(button);

			MicrophoneSolid(node_1, { class: 'me-2 h-5 w-5' });
			$.reset(button);
			$.delegated('click', button, handleVoiceBtn);
			$.append($$anchor, button);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Button(node_2, {
		size: 'sm',
		class: 'p-2!',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_3 = $.first_child(fragment);

			SearchOutline(node_3, { class: '-ms-1 me-2 h-6 w-6' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, form);
}

$.delegate(['click']);