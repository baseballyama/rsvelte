import * as $ from 'svelte/internal/server';
import { MediaQuery } from "svelte/reactivity";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const mq = new MediaQuery("(max-width: 599px), (min-width: 900px)");
		const mq2 = new MediaQuery("min-width: 900px");
		const mq3 = new MediaQuery("screen");
		const mq4 = new MediaQuery("not print");
		const mq5 = new MediaQuery("screen,print");
		const mq6 = new MediaQuery("screen,      print");
		const mq7 = new MediaQuery("screen,      random");
	});
}