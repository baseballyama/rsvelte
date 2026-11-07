import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import { fade } from 'svelte/transition';
import { useOptions } from '../options.svelte.js';
import Entry from './Entry.svelte';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import Preview from './Preview.svelte';

export default function PromiseView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = Promise.resolve(),
			key,
			type,
			path,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const options = useOptions();
		let status = 'pending';
		let result = undefined;
		let currentPromise = void 0;
		let expandable = void 0;
		let entries = $.derived(() => Object.entries({ state: status, result }));

		function handleSuccess(res, promise) {
			if (promise === value) {
				result = res;

				if (status !== 'fulfilled') {
					status = 'fulfilled';
					expandable?.flash();
				}
			}
		}

		function handleReject(err, promise) {
			if (promise === value) {
				result = err;
				status = 'rejected';
				expandable?.flash();
			}
		}

		function resolvePromise(promise) {
			status = 'pending';
			result = undefined;

			try {
				promise.then((res) => handleSuccess(res, promise), (e) => handleReject(e, promise)).catch((e) => handleReject(e, promise));
			} catch(err) {
				handleReject(err, promise);
			}
		}

		{
			function valuePreview($$renderer, { showPreview }) {
				$$renderer.push(`<!---->`);

				{
					$$renderer.push(`<span${$.attr_class(`value promise ${$.stringify(status)}`, 'svelte-xznbea')}><span class="bracket svelte-xznbea">&lt;</span> ${$.escape(`${status}`)} `);

					if (status === 'fulfilled' || status === 'rejected') {
						$$renderer.push('<!--[0-->');

						Preview($$renderer, {
							showPreview,
							prefix: ':',
							singleValue: { value: result },
							startLevel: 0,
							showKey: false,
							style: 'gap:0',
							bracketStyle: 'margin: 0; font-weight: bold'
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <span class="bracket svelte-xznbea">></span></span>`);
				}

				$$renderer.push(`<!---->`);
			}

			Expandable($$renderer, $.spread_props([
				{ value, key, type, path },
				{ length: entries().length, showLength: false },
				rest,
				{
					valuePreview,
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(entries());

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let [key, value] = each_array[i];

							Entry($$renderer, {
								i,
								children: ($$renderer) => {
									Node($$renderer, { value, key, path });
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { valuePreview: true, default: true }
				}
			]));
		}
	});
}