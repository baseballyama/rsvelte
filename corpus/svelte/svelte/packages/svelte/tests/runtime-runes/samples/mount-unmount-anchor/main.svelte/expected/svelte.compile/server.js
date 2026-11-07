import * as $ from 'svelte/internal/server';
import { mount, unmount } from "svelte";
import Component from "./Component.svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let target;

		function generate() {
			for (let i = 0; i < 1000; i++) {
				let myInnocentState = { text: "hello" };
				const toUnmount = mount(Component, { target, props: myInnocentState });

				unmount(toUnmount);
			}
		}

		$$renderer.push(`<button>generate</button> <div></div>`);
	});
}