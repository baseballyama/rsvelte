import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class CustomElement extends HTMLElement {
			constructor() {
				super();
				this.attachShadow({ mode: 'open' });

				Object.defineProperty(this, 'property', {
					set: (value) => {
						this.shadowRoot.innerHTML = typeof value + '|' + JSON.stringify(value);
					}
				});
			}
		}

		onMount(async () => {
			customElements.define('set-property-before-mounted', CustomElement);
		});

		let property = void 0;

		$$renderer.push(`<button>Update</button> <set-property-before-mounted${$.attr('property', property)}></set-property-before-mounted> `);

		if (property) {
			$$renderer.push(`<!--[0--><set-property-before-mounted${$.attr('property', property)}></set-property-before-mounted>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}