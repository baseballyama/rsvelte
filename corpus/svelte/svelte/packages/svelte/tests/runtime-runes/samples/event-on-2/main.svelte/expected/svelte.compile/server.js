import * as $ from 'svelte/internal/server';
import { on } from 'svelte/events';
import Wrapper from './wrapper.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function handleParentKeyDown() {
			console.log('parent keydown');
		}

		function keydownOne(node) {
			on(node, 'keydown', (e) => console.log('one'));
		}

		function keydownTwo(node) {
			on(node, 'keydown', (e) => console.log('two'));
		}

		function keydownThree(node) {
			on(node, 'keydown', (e) => console.log('three'));
		}

		Wrapper($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div><button>button</button></div>`);
			},
			$$slots: { default: true }
		});
	});
}