import * as $ from 'svelte/internal/server';
import answer from './answer.js';
import problems from './problems.js';

export default function Main($$renderer) {
	$$renderer.push(`<div>i got ${$.escape(problems)} problems</div> <div>the answer is ${$.escape(answer)}</div>`);
}