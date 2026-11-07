import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let files;

		onMount(() => {
			let list = new DataTransfer();
			let file = new File(["content"], "filename.jpg");

			list.items.add(file);
			files = list.files;
		});

		$$renderer.push(`<input type="file"/> <button>Reset</button>`);
	});
}