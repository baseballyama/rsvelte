import * as $ from 'svelte/internal/server';

export default function Class_ts($$renderer) {
	let active = false;
	let level = 1;
	let tone = 'warm';
	$$renderer.push(`<div${$.attr_class($.clsx({ active, [tone]: level > 1 }), void 0, { 'high': level > 2 })}>typed</div> <div${$.attr_class('', void 0, { 'missing': active.length })}>error</div> <button>${$.escape(level)}</button>`);
}
