import * as $ from 'svelte/internal/server';
import Button from './Button.svelte';

export default function Main($$renderer) {
	let text = 'click me';
	let text2 = '';
	let spread = { onclick: () => text = 'click spread' };

	Button($$renderer, $.spread_props([
		{ onclick: () => text = 'click onclick' },
		spread,
		{
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(text)}`);
			},
			$$slots: { default: true }
		}
	]));

	$$renderer.push(`<!----> `);

	Button($$renderer, $.spread_props([
		spread,
		{
			onclick: () => text = 'click onclick',
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(text)}`);
			},
			$$slots: { default: true }
		}
	]));

	$$renderer.push(`<!----> `);

	Button($$renderer, $.spread_props([
		{ onclick: () => text = 'click onclick' },
		spread,
		{
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(text)}${$.escape(text2)}`);
			},
			$$slots: { default: true }
		}
	]));

	$$renderer.push(`<!----> `);

	Button($$renderer, $.spread_props([
		spread,
		{
			onclick: () => text = 'click onclick',
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(text)}${$.escape(text2)}`);
			},
			$$slots: { default: true }
		}
	]));

	$$renderer.push(`<!---->`);
}