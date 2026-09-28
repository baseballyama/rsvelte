import * as $ from 'svelte/internal/server';
import Textfield from '@smui/textfield';

export default function _DifferentTypes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let valueTypeNumber = 0;
		let valueTypeNumberStep = 0;
		let valueTypeDate = '';
		let valueTypeFiles = null;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="columns margins"><div>`);

			Textfield($$renderer, {
				label: 'Number',
				type: 'number',
				get value() {
					return valueTypeNumber;
				},

				set value($$value) {
					valueTypeNumber = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div>`);

			Textfield($$renderer, {
				label: 'Number with Step',
				type: 'number',
				input$step: '2',
				get value() {
					return valueTypeNumberStep;
				},

				set value($$value) {
					valueTypeNumberStep = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div>`);

			Textfield($$renderer, {
				label: 'DateTime-Local',
				type: 'datetime-local',
				get value() {
					return valueTypeDate;
				},

				set value($$value) {
					valueTypeDate = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="hide-file-ui svelte-s8jtzn">`);

			Textfield($$renderer, {
				label: 'File',
				type: 'file',
				get files() {
					return valueTypeFiles;
				},

				set files($$value) {
					valueTypeFiles = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}