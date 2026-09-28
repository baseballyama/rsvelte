import * as $ from 'svelte/internal/server';
import { Search, Button } from "flowbite-svelte";
import { MicrophoneSolid, SearchOutline } from "flowbite-svelte-icons";

export default function Voice($$renderer) {
	function handleVoiceBtn() {
		alert("You clicked voice button");
	}

	$$renderer.push(`<form class="flex gap-2">`);

	Search($$renderer, {
		size: 'lg',
		classes: { input: "flex items-center gap-2" },
		placeholder: 'Search Mockups, Logos, Design Templates...',
		children: ($$renderer) => {
			$$renderer.push(`<button type="button" class="outline-hidden">`);
			MicrophoneSolid($$renderer, { class: 'me-2 h-5 w-5' });
			$$renderer.push(`<!----></button>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		size: 'sm',
		class: 'p-2!',
		children: ($$renderer) => {
			SearchOutline($$renderer, { class: '-ms-1 me-2 h-6 w-6' });
			$$renderer.push(`<!----> Search`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></form>`);
}