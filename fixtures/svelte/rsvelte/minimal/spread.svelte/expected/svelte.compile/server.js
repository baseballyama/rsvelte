import * as $ from 'svelte/internal/server';

export default function Spread($$renderer, $$props) {
	let { children, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<div${$.attributes({ ...rest })}>plain</div> <section${$.attributes({ id: 'main', ...rest, title: 'after' })}>ordered</section> <button${$.attributes({ ...rest })}>typed by the spread</button> <img${$.attributes({ ...rest, alt: '' })} onload="this.__e=event" onerror="this.__e=event"/>`);
}