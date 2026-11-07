import * as $ from 'svelte/internal/server';
import Textfield from '@smui/textfield';
import CharacterCounter from '@smui/textfield/character-counter';

export default function _TextareaCharacterCount($$renderer) {
	let value = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="margins">`);

		{
			function internalCounter($$renderer) {
				CharacterCounter($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->0 / 100`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				textarea: true,
				input$maxlength: 100,
				label: 'Label',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},
				internalCounter,
				$$slots: { internalCounter: true }
			});
		}

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}