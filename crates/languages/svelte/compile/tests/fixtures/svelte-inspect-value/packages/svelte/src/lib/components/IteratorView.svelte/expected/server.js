import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { getPreviewLevel, useValueCache } from '../contexts.js';
import { stringifyPath } from '../util.js';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import NodeActionButton from './NodeActionButton.svelte';
import Preview from './Preview.svelte';
import PropertyList from './PropertyList.svelte';
import { nodeActionKeydown } from '../util.js';

export default function IteratorView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value: iterator,
			key = undefined,
			type,
			path = [],
			showKey,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const valueCache = useValueCache();
		const previewLevel = getPreviewLevel();
		let stringifiedPath = $.derived(() => stringifyPath(path));
		let hasCached = $.derived(() => valueCache.has(stringifiedPath()));
		let unwrap = [];
		let busy = false;
		let isDone = false;

		onMount(() => {
			if (hasCached()) {
				const cachedValue = valueCache.get(stringifiedPath());

				if (cachedValue) {
					unwrap = cachedValue.unwrap;
					isDone = cachedValue.done;
				}
			}
		});

		async function next(e) {
			e.stopPropagation();
			busy = true;

			const { value, done } = await iterator.next();

			busy = false;

			if (typeof done === 'boolean') isDone = done;

			if (!done) {
				unwrap.push(value);
			}

			valueCache.set(stringifiedPath(), { unwrap: $.snapshot(unwrap), done: isDone });
		}

		async function complete(e) {
			e.stopPropagation();
			busy = true;

			let result = await iterator.next();
			let i = 0;

			while (!result.done && i < 100) {
				i++;
				unwrap.push(result.value);
				result = await iterator.next();

				if (typeof result.done === 'boolean') isDone = result.done;
			}

			busy = false;
			valueCache.set(stringifiedPath(), { unwrap: $.snapshot(unwrap), done: isDone });
		}

		{
			function valuePreview($$renderer, { showPreview }) {
				if (!previewLevel) {
					$$renderer.push('<!--[0-->');

					NodeActionButton($$renderer, {
						busy,
						disabled: isDone,
						onclick: next,
						onkeydown: nodeActionKeydown(next),
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(isDone ? 'done' : 'next')}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (!isDone) {
						$$renderer.push('<!--[0-->');

						NodeActionButton($$renderer, {
							busy,
							disabled: isDone,
							onclick: complete,
							onkeydown: nodeActionKeydown(complete),
							children: ($$renderer) => {
								$$renderer.push(`<!---->100`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				Preview($$renderer, {
					path,
					list: unwrap,
					prefix: '[',
					postfix: ']',
					showPreview,
					showKey: false
				});

				$$renderer.push(`<!---->`);
			}

			Expandable($$renderer, $.spread_props([
				{ value: iterator, key, type, path },
				{ length: unwrap.length, showKey, showLength: false },
				rest,
				{
					valuePreview,
					children: ($$renderer) => {
						{
							function item($$renderer, { key }) {
								Node($$renderer, { key, path, value: unwrap[key] });
							}

							PropertyList($$renderer, {
								value: unwrap,
								keys: [...unwrap.keys()],
								item,
								$$slots: { item: true }
							});
						}
					},
					$$slots: { valuePreview: true, default: true }
				}
			]));
		}
	});
}