import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let text = {
			value: 'svelte',
			get uppercase() {
				return this.value.toUpperCase();
			},

			set uppercase(v) {
				this.value = v.toLowerCase();
			}
		};

		$$renderer.push(`<input${$.attr('value', text.uppercase)}/> <p>${$.escape(text.value)}</p>`);
	});
}