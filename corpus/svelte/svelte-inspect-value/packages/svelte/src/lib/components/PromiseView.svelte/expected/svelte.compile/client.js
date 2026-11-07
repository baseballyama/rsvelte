import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';
import { fade } from 'svelte/transition';
import { useOptions } from '../options.svelte.js';
import Entry from './Entry.svelte';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import Preview from './Preview.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'key',
	'type',
	'path'
]);

var root = $.from_html(`<span><span class="bracket svelte-xznbea">&lt;</span> <!> <span class="bracket svelte-xznbea">&gt;</span></span>`);

export default function PromiseView($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 19, () => Promise.resolve()),
		rest = $.rest_props($$props, rest_excludes);

	const options = useOptions();
	let status = $.state('pending');
	let result = $.state(undefined);
	let currentPromise = $.state(void 0);
	let expandable = $.state(void 0);
	let entries = $.derived(() => Object.entries({ state: $.get(status), result: $.get(result) }));

	function handleSuccess(res, promise) {
		if (promise === value()) {
			$.set(result, res, true);

			if ($.get(status) !== 'fulfilled') {
				$.set(status, 'fulfilled');
				$.get(expandable)?.flash();
			}
		}
	}

	function handleReject(err, promise) {
		if (promise === value()) {
			$.set(result, err, true);
			$.set(status, 'rejected');
			$.get(expandable)?.flash();
		}
	}

	function resolvePromise(promise) {
		$.set(status, 'pending');
		$.set(result, undefined);

		try {
			promise.then((res) => handleSuccess(res, promise), (e) => handleReject(e, promise)).catch((e) => handleReject(e, promise));
		} catch(err) {
			handleReject(err, promise);
		}
	}

	$.user_effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		value();

		untrack(() => {
			if ($.get(currentPromise) !== value()) {
				$.set(currentPromise, value(), true);
				resolvePromise(value());
			}
		});
	});

	{
		const valuePreview = ($$anchor, $$arg0) => {
			let showPreview = () => ($$arg0?.()).showPreview;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.key(node, () => $.get(status), ($$anchor) => {
				var span = root();
				var text = $.sibling($.child(span));
				var node_1 = $.sibling(text);

				{
					var consequent = ($$anchor) => {
						{
							let $0 = $.derived(() => ({ value: $.get(result) }));

							Preview($$anchor, {
								get showPreview() {
									return showPreview();
								},
								prefix: ':',
								get singleValue() {
									return $.get($0);
								},
								startLevel: 0,
								showKey: false,
								style: 'gap:0',
								bracketStyle: 'margin: 0; font-weight: bold'
							});
						}
					};

					$.if(node_1, ($$render) => {
						if ($.get(status) === 'fulfilled' || $.get(status) === 'rejected') $$render(consequent);
					});
				}

				$.next(2);
				$.reset(span);

				$.template_effect(() => {
					$.set_class(span, 1, `value promise ${$.get(status) ?? ''}`, 'svelte-xznbea');
					$.set_text(text, ` ${`${$.get(status)}`} `);
				});

				$.transition(1, span, () => fade, () => ({ duration: options.transitionDuration }));
				$.append($$anchor, span);
			});

			$.append($$anchor, fragment_1);
		};

		$.bind_this(
			Expandable($$anchor, $.spread_props(
				() => ({
					value: value(),
					key: $$props.key,
					type: $$props.type,
					path: $$props.path
				}),
				{
					get length() {
						return $.get(entries).length;
					},
					showLength: false
				},
				() => rest,
				{
					valuePreview,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_2 = $.first_child(fragment_3);

						$.each(node_2, 19, () => $.get(entries), ([key, value]) => key, ($$anchor, $$item, i, $$array) => {
							var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
							let key = () => $.get($$array_1)[0];
							let value = () => $.get($$array_1)[1];

							Entry($$anchor, {
								get i() {
									return $.get(i);
								},

								children: ($$anchor, $$slotProps) => {
									Node($$anchor, {
										get value() {
											return value();
										},

										get key() {
											return key();
										},

										get path() {
											return $$props.path;
										}
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { valuePreview: true, default: true }
				}
			)),
			($$value) => $.set(expandable, $$value, true),
			() => $.get(expandable)
		);
	}

	$.pop();
}