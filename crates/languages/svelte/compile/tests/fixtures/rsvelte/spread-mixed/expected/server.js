import * as $ from 'svelte/internal/server';

export default function Spread_mixed($$renderer, $$props) {
	let { class: className, $$slots, $$events, ...rest } = $$props;
	let count = 0;
	let active = false;
	function extra() {
		return { 'data-extra': count };
	}
	function log() {
		console.log(count);
	}
	$$renderer.push(`<div${$.attributes({ ...rest, class: $.clsx(className), 'data-count': count })}>events</div> <div${$.attributes({ ...extra(), title: `n ${$.stringify(count)}` }, void 0, { active })}>memoized</div> <p${$.attributes({ class: 'note', ...rest, hidden: true })}>static</p> <span${$.attributes({ ...{ role: 'status' }, 'aria-live': 'polite' })}>${$.escape(count)}</span> <button type="button">toggle</button>`);
}
