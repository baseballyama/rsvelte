import * as $ from 'svelte/internal/server';
import toast_ from '../lib';

export default function RichContent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { toast, someProp } = $$props;

		$$renderer.push(`<span>Custom and <b>bold</b> with props like ${$.escape(someProp)}! <button>Dismiss</button></span>`);
	});
}