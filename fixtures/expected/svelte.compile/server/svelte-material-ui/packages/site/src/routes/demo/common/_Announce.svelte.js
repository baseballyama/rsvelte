import * as $ from 'svelte/internal/server';
import Button, { Label } from '@smui/button';
import Textfield from '@smui/textfield';
import { announce } from '@smui/common/internal';

export default function _Announce($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let text = '';

		function loremIpsum() {
			text = 'But I must explain to you how all this mistaken idea of denouncing of ' + 'a pleasure and praising pain was born and I will give you a complete ' + 'account of the system, and expound the actual teachings of the great ' + 'explorer of the truth, the master-builder of human happiness. No one ' + 'rejects, dislikes, or avoids pleasure itself, because it is pleasure, ' + 'but because those who do not know how to pursue pleasure rationally ' + 'encounter consequences that are extremely painful. Nor again is there ' + 'anyone who loves or pursues or desires to obtain pain of itself, ' + 'because it is pain, but occasionally circumstances occur in which ' + 'toil and pain can procure him some great pleasure. To take a trivial ' + 'example, which of us ever undertakes laborious physical exercise, ' + 'except to obtain some advantage from it? But who has any right to ' + 'find fault with a man who chooses to enjoy a pleasure that has no ' + 'annoying consequences, or one who avoids a pain that produces no ' + 'resultant pleasure?';
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div>Note that this demo will not work for you if you are not using a screen
  reader. `);

			Textfield($$renderer, {
				label: 'Text',
				textarea: true,
				style: 'width: 100%; margin: 1em 0 .5em;',
				get value() {
					return text;
				},

				set value($$value) {
					text = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div style="text-align: end;">`);

			Button($$renderer, {
				onclick: loremIpsum,
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Fill Lorem Ipsum`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				onclick: () => announce(text, { priority: 'assertive' }),
				variant: 'raised',
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Speak`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
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