import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div${$.attributes({ ...{ class: 'bar' }, class: 'foo' }, 'svelte-10afyce')}>red</div> <div${$.attributes({ class: 'foo', ...{ class: 'qux' } }, 'svelte-10afyce')}>red</div> <div${$.attributes({ ...{ class: 'bar' } }, 'svelte-10afyce')}>red and bold</div>`);
}