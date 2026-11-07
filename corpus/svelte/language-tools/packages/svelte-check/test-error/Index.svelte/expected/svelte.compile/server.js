import * as $ from 'svelte/internal/server';
import Jsdoc from './Jsdoc.svelte';
import { foo } from './relative';
import nope from '../../outside';

export default function Index($$renderer) {
	let count = 'oops';
	let x = 0;

	// prettier-ignore
	x === '2';

	foo === '';
	$$renderer.push(`<p>oops</p> `);
	Jsdoc($$renderer, {});
	$$renderer.push(`<!---->`);
}