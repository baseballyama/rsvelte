import * as $ from 'svelte/internal/server';
import { Textarea, Button } from "flowbite-svelte";

export default function ElementRef($$renderer) {
	let textareaRef = void 0;
	let textContent = "This is some example text that will be selected when you click the button.";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Textarea($$renderer, {
			placeholder: 'Type something here...',
			class: 'w-full',
			get elementRef() {
				return textareaRef;
			},

			set elementRef($$value) {
				textareaRef = $$value;
				$$settled = false;
			},

			get value() {
				return textContent;
			},

			set value($$value) {
				textContent = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			class: 'mt-2',
			onclick: () => {
				textareaRef?.focus();
				textareaRef?.setSelectionRange(0, textareaRef.value.length);
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Select All Text`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}