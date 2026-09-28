import * as $ from 'svelte/internal/server';
import { createClassComponent } from 'svelte/legacy';
import Component from './component.svelte';
import { mount, onMount } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let div1;
		let div2;
		let legacy;
		const props = { foo: 'foo', baz: 'baz' };

		onMount(() => {
			legacy = createClassComponent({
				component: Component,
				target: div1,
				props: { foo: 'foo', baz: 'baz' }
			});

			mount(Component, { target: div2, props });
		});

		$$renderer.push(`<button>reset</button> ${$.escape(props.foo)} ${$.escape(props.bar)} ${$.escape(props.baz)} ${$.escape(props.buz)} <div></div> <div></div>`);
	});
}