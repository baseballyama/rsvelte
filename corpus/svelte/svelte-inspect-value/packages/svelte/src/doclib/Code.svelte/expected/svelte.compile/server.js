import * as $ from 'svelte/internal/server';
import Copy from '$doclib/icons/Copy.svelte';
import Inspect from '$lib/Inspect.svelte';
import { getContext } from 'svelte';
import { fly } from 'svelte/transition';
import { highlight } from './shiki.js';

export default function Code($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			code,
			label = 'example',
			language = 'svelte',
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const multi = getContext('multi');
		let highlighted = $.derived(() => children ? undefined : highlight(code, language));
		let copied = false;
		let timeout;

		async function copyCode() {
			try {
				await navigator.clipboard.writeText(code);
				copied = true;

				if (timeout) window.clearTimeout(timeout);

				timeout = window.setTimeout(
					() => {
						copied = false;
					},
					5000
				);
			} catch(e) {
				console.error(e);
				copied = false;
			}
		}

		{
			function failed($$renderer, error, reset) {
				Inspect($$renderer, { value: error });
				$$renderer.push(`<!----> <button>retry</button>`);
			}

			$$renderer.boundary({ failed }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				{
					$$renderer.push(`<div${$.attributes({ class: 'code', ...rest }, 'svelte-1g6xvrs', { multi })}><div class="util svelte-1g6xvrs">`);

					if (label) {
						$$renderer.push(`<!--[0--><div class="label svelte-1g6xvrs">${$.escape(label)}</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <button title="copy code"${$.attr_class('svelte-1g6xvrs', void 0, { 'copied': copied })}>`);
					Copy($$renderer, {});
					$$renderer.push(`<!----></button></div> `);

					if (children) {
						$$renderer.push('<!--[0-->');
						children($$renderer);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');

						$.await(
							$$renderer,
							highlighted(),
							() => {
								$$renderer.push(`...`);
							},
							(result) => {
								$$renderer.push(`<div>${$.html(result)}</div>`);
							}
						);

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]-->`);
			});
		}
	});
}