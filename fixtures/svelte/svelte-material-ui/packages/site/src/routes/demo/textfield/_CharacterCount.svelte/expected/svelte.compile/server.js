import * as $ from 'svelte/internal/server';
import Textfield from '@smui/textfield';
import CharacterCounter from '@smui/textfield/character-counter';

export default function _CharacterCount($$renderer) {
	let valueA = '';
	let valueB = '';
	let valueC = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="columns margins"><div>`);

		{
			function helper($$renderer) {
				CharacterCounter($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->0 / 18`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				label: 'Standard',
				input$maxlength: 18,
				get value() {
					return valueA;
				},

				set value($$value) {
					valueA = $$value;
					$$settled = false;
				},
				helper,
				$$slots: { helper: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(valueA)}</pre></div> <div>`);

		{
			function helper($$renderer) {
				CharacterCounter($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->0 / 18`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				variant: 'filled',
				label: 'Filled',
				input$maxlength: 18,
				get value() {
					return valueB;
				},

				set value($$value) {
					valueB = $$value;
					$$settled = false;
				},
				helper,
				$$slots: { helper: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(valueB)}</pre></div> <div>`);

		{
			function helper($$renderer) {
				CharacterCounter($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->0 / 18`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				variant: 'outlined',
				label: 'Outlined',
				input$maxlength: 18,
				get value() {
					return valueC;
				},

				set value($$value) {
					valueC = $$value;
					$$settled = false;
				},
				helper,
				$$slots: { helper: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(valueC)}</pre></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}