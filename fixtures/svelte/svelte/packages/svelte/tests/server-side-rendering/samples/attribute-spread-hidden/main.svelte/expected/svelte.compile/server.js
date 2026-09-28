import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div${$.attributes({ ...{ hidden: false } })}>A</div> <div${$.attributes({ ...{ hidden: true } })}>B</div> <div${$.attributes({ ...{ hidden: 'until-found' } })}>C</div>`);
}