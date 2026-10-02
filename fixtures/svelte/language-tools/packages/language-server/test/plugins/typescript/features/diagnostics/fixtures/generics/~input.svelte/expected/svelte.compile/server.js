import * as $ from 'svelte/internal/server';
import Generics from './generics.svelte';

export default function Input($$renderer) {
	Generics($$renderer, {
		a: ['a', 'b'],
		b: 'anchor',
		c: false,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { a, b }) => {
				$$renderer.push(`<!---->${$.escape(a === 'str')}${$.escape(b === 'anchor')}`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Generics($$renderer, {
		a: [{ a: 1, b: 1 }],
		b: 'asd',
		c: '',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { a }) => {
				$$renderer.push(`<!---->${$.escape(a === true)}`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Generics($$renderer, {
		a: ['a', 'b'],
		b: 'anchor',
		c: false,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { b }) => {
				$$renderer.push(`<!---->${$.escape(b === 'big')}`);
			}
		}
	});

	$$renderer.push(`<!---->`);
}