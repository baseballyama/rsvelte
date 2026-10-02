import * as $ from 'svelte/internal/server';
import { SmuiElement } from '@smui/common';
import Button, { Label } from '@smui/button';
import { onMount } from 'svelte';

export default function _SmuiElement($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// When you change the tag, you can use the generic type argument to get the
		// right element from `getElement`. The first arg for Button is "href".
		let DivButton;

		let DivButtonElement;

		onMount(() => {
			DivButtonElement = DivButton.getElement();
			console.log(DivButtonElement);
		});

		$$renderer.push(`<div>`);

		Button($$renderer, {
			tag: 'div',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->I'm a &lt;div /> Button`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			tag: 'span',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->I'm a &lt;span /> Button`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			tag: 'strong',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->I'm a &lt;strong /> Button`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			tag: 'em',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->I'm a &lt;em /> Button`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div>`);

		SmuiElement($$renderer, {
			tag: 'em',
			children: ($$renderer) => {
				$$renderer.push(`<!---->I'm rendered as a HTML <code>em</code> element!`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}