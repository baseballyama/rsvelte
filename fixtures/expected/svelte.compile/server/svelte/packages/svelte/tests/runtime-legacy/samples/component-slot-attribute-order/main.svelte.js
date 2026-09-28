import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	let disabled = false;

	$$renderer.push(`<button>Disable</button> `);

	Component($$renderer, {
		$$slots: {
			footer: ($$renderer) => {
				$$renderer.push(`<button slot="footer"${$.attr('disabled', disabled, true)}>Button</button>`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		$$slots: {
			footer: ($$renderer) => {
				$$renderer.push(`<button${$.attr('disabled', disabled, true)} slot="footer">Button</button>`);
			}
		}
	});

	$$renderer.push(`<!---->`);
}