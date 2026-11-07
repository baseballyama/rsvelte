import * as $ from 'svelte/internal/server';
import Option from './Option.svelte';

export default function Main($$renderer) {
	$$renderer.select(
		{ value: 'dog' },
		($$renderer) => {
			Option($$renderer, {
				value: '',
				children: ($$renderer) => {
					$$renderer.push(`<!---->--Please choose an option--`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);

			Option($$renderer, {
				value: 'dog',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Dog`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);

			Option($$renderer, {
				value: 'cat',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Cat`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);
}