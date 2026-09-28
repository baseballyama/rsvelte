import * as $ from 'svelte/internal/server';
import { spread } from './spread.js';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let dynamic = 'dynamic';

		$$renderer.push(`<div><p${$.attributes({ ...spread() })}>static stuff</p></div> <div><p${$.attributes({ ...spread() })}>${$.escape(dynamic)} stuff</p></div> <button>unused</button>`);
	});
}