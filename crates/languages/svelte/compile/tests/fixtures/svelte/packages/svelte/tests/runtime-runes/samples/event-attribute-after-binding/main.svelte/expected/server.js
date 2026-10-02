import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let checked_simple = false;
	let checked_simple_copy = false;
	let checked_rest = false;
	let checked_rest_copy = false;
	let rest = () => ({});

	$$renderer.push(`<!---->${$.escape(checked_simple)} ${$.escape(checked_simple_copy)} <input type="checkbox"${$.attr('checked', checked_simple, true)}/> ${$.escape(checked_rest)} ${$.escape(checked_rest_copy)} <input${$.attributes({ type: 'checkbox', ...rest(), checked: checked_rest }, void 0, void 0, void 0, 4)}/>`);
}