import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isArray, isObject } from '../util.js';
import { htmlState } from '../util/mutation-observer.svelte.js';
import Expandable from './Expandable.svelte';
import GetterSetter from './GetterSetter.svelte';
import HtmlValue from './HTMLValue.svelte';
import Node from './Node.svelte';
import PropertyList from './PropertyList.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'key',
	'path',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function HTMLViewSimple($$anchor, $$props) {
	$.push($$props, true);

	let key = $.prop($$props, 'key', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	// svelte-ignore state_referenced_locally TODO
	let element = htmlState($$props.value);

	let current = $.proxy({ scrollLeft: 0, scrollTop: 0, clientHeight: 0, clientWidth: 0 });

	$.user_effect(() => {
		const onscroll = (event) => {
			const target = event.target;

			current.scrollLeft = target.scrollLeft;
			current.scrollTop = target.scrollTop;
		};

		const resizeObserver = new ResizeObserver(([entry]) => {
			current.clientHeight = entry.target.clientHeight;
			current.clientWidth = entry.target.clientWidth;
			current.scrollLeft = entry.target.scrollLeft;
			current.scrollTop = entry.target.scrollTop;
		});

		if ($$props.value) {
			$$props.value.addEventListener('scroll', onscroll);
			resizeObserver.observe($$props.value);
		}

		return () => {
			$$props.value.removeEventListener('scroll', onscroll);
			resizeObserver.disconnect();
		};
	});

	$.user_effect(() => {
		if ($$props.value && $$props.value !== element.ele) {
			element.destroy();
			element = htmlState($$props.value);
		}
	});

	let attrs = $.derived(() => {
		if (element.ele) {
			return Object.entries(element.ele.attributes ?? {}).map(([, attr]) => [attr.name, attr.value]).filter(([name]) => !['class', 'style', 'data'].includes(name) && !name.startsWith('data-'));
		}

		return [];
	});

	let styles = $.derived(() => {
		if (element.ele) {
			const elementStyle = element.ele.style;
			const out = [];

			for (const prop in elementStyle) {
				if (Object.hasOwn(elementStyle, prop) && !Number.isNaN(Number.parseInt(prop))) {
					const value = elementStyle.getPropertyValue(elementStyle[prop]);

					if (value) out.push([
						elementStyle[prop],
						elementStyle.getPropertyValue(elementStyle[prop])
					]);
				}
			}

			return out;
		}

		return [];
	});

	let entries = $.derived(() => Object.entries({
		...Object.fromEntries($.get(attrs)),
		class: element.ele.className?.split(' ').filter(Boolean) ?? [],
		styles: Object.fromEntries($.get(styles)),
		data: Object.fromEntries(Object.entries(element.ele.dataset ?? {})),
		...current,
		children: $$props.value.children,
		value: $$props.value.value
	}).filter(([, v]) => isArray(v)
		? v.length
		: isObject(v) ? Object.entries(v).length : v != null));

	{
		const valuePreview = ($$anchor) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.key(node, () => $$props.value, ($$anchor) => {
				HtmlValue($$anchor, {
					get value() {
						return $$props.value;
					}
				});
			});

			$.append($$anchor, fragment_1);
		};

		Expandable($$anchor, $.spread_props(
			() => ({ value: $$props.value, key: key(), path: $$props.path }),
			{
				get length() {
					return $.get(entries).length;
				},
				keepPreviewOnExpand: true
			},
			() => rest,
			{
				valuePreview,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_1 = $.first_child(fragment_3);

					{
						var consequent = ($$anchor) => {
							var fragment_4 = $.comment();
							var node_2 = $.first_child(fragment_4);

							$.snippet(node_2, () => $$props.children);
							$.append($$anchor, fragment_4);
						};

						$.if(node_1, ($$render) => {
							if ($$props.children) $$render(consequent);
						});
					}

					var node_3 = $.sibling(node_1, 2);

					{
						const item = ($$anchor, $$arg0) => {
							let key = () => ($$arg0?.()).key;
							let descriptor = () => ($$arg0?.()).descriptor;
							var fragment_5 = $.comment();
							var node_4 = $.first_child(fragment_5);

							{
								var consequent_1 = ($$anchor) => {
									GetterSetter($$anchor, {
										get value() {
											return $$props.value;
										},

										get descriptor() {
											return descriptor();
										},

										get key() {
											return key();
										},

										get path() {
											return $$props.path;
										}
									});
								};

								var alternate = ($$anchor) => {
									{
										let $0 = $.derived(() => $.get(entries).find((e) => e[0] === key())?.[1]);

										Node($$anchor, {
											get value() {
												return $.get($0);
											},

											get key() {
												return key();
											},

											get path() {
												return $$props.path;
											}
										});
									}
								};

								$.if(node_4, ($$render) => {
									if ((key() === 'children' || key() === 'value') && (descriptor()?.get || descriptor()?.set)) $$render(consequent_1); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_5);
						};

						let $0 = $.derived(() => $.get(entries).map((e) => e[0]));

						PropertyList(node_3, {
							get keys() {
								return $.get($0);
							},

							get value() {
								return $$props.value;
							},
							item,
							$$slots: { item: true }
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { valuePreview: true, default: true }
			}
		));
	}

	$.pop();
}