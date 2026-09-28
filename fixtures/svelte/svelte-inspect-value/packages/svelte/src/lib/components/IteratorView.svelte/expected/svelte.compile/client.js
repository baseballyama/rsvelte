import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { getPreviewLevel, useValueCache } from '../contexts.js';
import { stringifyPath } from '../util.js';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import NodeActionButton from './NodeActionButton.svelte';
import Preview from './Preview.svelte';
import PropertyList from './PropertyList.svelte';
import { nodeActionKeydown } from '../util.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'key',
	'type',
	'path',
	'showKey'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function IteratorView($$anchor, $$props) {
	$.push($$props, true);

	let key = $.prop($$props, 'key', 3, undefined),
		path = $.prop($$props, 'path', 19, () => []),
		rest = $.rest_props($$props, rest_excludes);

	const valueCache = useValueCache();
	const previewLevel = getPreviewLevel();
	let stringifiedPath = $.derived(() => stringifyPath(path()));
	let hasCached = $.derived(() => valueCache.has($.get(stringifiedPath)));
	let unwrap = $.state($.proxy([]));
	let busy = $.state(false);
	let isDone = $.state(false);

	onMount(() => {
		if ($.get(hasCached)) {
			const cachedValue = valueCache.get($.get(stringifiedPath));

			if (cachedValue) {
				$.set(unwrap, cachedValue.unwrap, true);
				$.set(isDone, cachedValue.done, true);
			}
		}
	});

	async function next(e) {
		e.stopPropagation();
		$.set(busy, true);

		const { value, done } = await $$props.value.next();

		$.set(busy, false);

		if (typeof done === 'boolean') $.set(isDone, done, true);

		if (!done) {
			$.get(unwrap).push(value);
		}

		valueCache.set($.get(stringifiedPath), { unwrap: $.snapshot($.get(unwrap)), done: $.get(isDone) });
	}

	async function complete(e) {
		e.stopPropagation();
		$.set(busy, true);

		let result = await $$props.value.next();
		let i = 0;

		while (!result.done && i < 100) {
			i++;
			$.get(unwrap).push(result.value);
			result = await $$props.value.next();

			if (typeof result.done === 'boolean') $.set(isDone, result.done, true);
		}

		$.set(busy, false);
		valueCache.set($.get(stringifiedPath), { unwrap: $.snapshot($.get(unwrap)), done: $.get(isDone) });
	}

	{
		const valuePreview = ($$anchor, $$arg0) => {
			let showPreview = () => ($$arg0?.()).showPreview;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => nodeActionKeydown(next));

						NodeActionButton(node_1, {
							get busy() {
								return $.get(busy);
							},

							get disabled() {
								return $.get(isDone);
							},
							onclick: next,
							get onkeydown() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, $.get(isDone) ? 'done' : 'next'));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					}

					var node_2 = $.sibling(node_1, 2);

					{
						var consequent = ($$anchor) => {
							{
								let $0 = $.derived(() => nodeActionKeydown(complete));

								NodeActionButton($$anchor, {
									get busy() {
										return $.get(busy);
									},

									get disabled() {
										return $.get(isDone);
									},
									onclick: complete,
									get onkeydown() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('100');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							}
						};

						$.if(node_2, ($$render) => {
							if (!$.get(isDone)) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				};

				$.if(node, ($$render) => {
					if (!previewLevel) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node, 2);

			Preview(node_3, {
				get path() {
					return path();
				},

				get list() {
					return $.get(unwrap);
				},
				prefix: '[',
				postfix: ']',
				get showPreview() {
					return showPreview();
				},
				showKey: false
			});

			$.append($$anchor, fragment_1);
		};

		Expandable($$anchor, $.spread_props(
			() => ({
				value: $$props.value,
				key: key(),
				type: $$props.type,
				path: path()
			}),
			{
				get length() {
					return $.get(unwrap).length;
				},

				get showKey() {
					return $$props.showKey;
				},
				showLength: false
			},
			() => rest,
			{
				valuePreview,
				children: ($$anchor, $$slotProps) => {
					{
						const item = ($$anchor, $$arg0) => {
							let key = () => ($$arg0?.()).key;

							Node($$anchor, {
								get key() {
									return key();
								},

								get path() {
									return path();
								},

								get value() {
									return $.get(unwrap)[key()];
								}
							});
						};

						let $0 = $.derived(() => [...$.get(unwrap).keys()]);

						PropertyList($$anchor, {
							get value() {
								return $.get(unwrap);
							},

							get keys() {
								return $.get($0);
							},
							item,
							$$slots: { item: true }
						});
					}
				},
				$$slots: { valuePreview: true, default: true }
			}
		));
	}

	$.pop();
}