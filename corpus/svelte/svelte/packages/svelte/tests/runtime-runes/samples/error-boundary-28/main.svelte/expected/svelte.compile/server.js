import * as $ from 'svelte/internal/server';
import Trigger from './Trigger.svelte';

export default function Main($$renderer) {
	let mounted = true;
	let broken = false;

	// Throwing derived — nothing in the live template reads `appContext`, so
	// invalidating it does NOT throw immediately (becomes dirty-and-unread).
	let data = $.derived(() => broken ? null : { value: 'ok' });

	let appContext = $.derived(() => data().value);

	{
		function failed($$renderer) {
			$$renderer.push(`<p>caught</p>`);
		}

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			{
				$$renderer.push(`<button>break</button> <button>unmount</button> `);

				if (mounted) {
					$$renderer.push('<!--[0-->');
					Trigger($$renderer, { getValue: () => appContext() });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		});
	}
}