import * as $ from 'svelte/internal/server';
import One from './One.svelte';

export default function Main($$renderer) {
	One($$renderer, {
		$$slots: {
			a: ($$renderer) => {
				$$renderer.push(`<div slot="a">a</div>`);
			}
		}
	});
}