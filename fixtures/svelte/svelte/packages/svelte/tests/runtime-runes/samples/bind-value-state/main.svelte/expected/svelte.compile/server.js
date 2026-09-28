import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let v = 0;

	let count = {
		get v() {
			return v;
		},

		set v(x) {
			{
				v = Math.min(100, +x);
			}
		}
	};

	$$renderer.push(`<input${$.attr('value', count.v)} type="number"/> <div>${$.escape(count.v)}</div>`);
}