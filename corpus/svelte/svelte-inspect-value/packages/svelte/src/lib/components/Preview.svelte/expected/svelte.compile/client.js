import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, setContext } from 'svelte';
import { useOptions } from '../options.svelte.js';
import { getPropertyDescriptor, getType } from '../util.js';
import GetterSetter from './GetterSetter.svelte';
import Key from './Key.svelte';
import Node from './Node.svelte';
import NodeActionButton from './NodeActionButton.svelte';
import Type from './Type.svelte';
import { fly, slide } from '../transition/index.js';

const comma = ($$anchor) => {
	var span = root_1();

	$.append($$anchor, span);
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'list',
	'keyValue',
	'keys',
	'singleValue',
	'path',
	'prefix',
	'postfix',
	'showKey',
	'keyDelim',
	'keyStyle',
	'startLevel',
	'showPreview',
	'class',
	'bracketStyle',
	'usedefaults'
]);

var root = $.from_html(`<div class="key-type-preview svelte-ol42oa"><!> <!></div>`);
var root_1 = $.from_html(`<span class="comma svelte-ol42oa">,</span>`);
var root_2 = $.from_html(`preview error. check console <!>`, 1);
var root_3 = $.from_html(`<span> </span>`);
var root_4 = $.from_html(`<!><!>`, 1);
var root_5 = $.from_html(`<!><span class="ellipsis svelte-ol42oa">&hellip;</span>`, 1);
var root_6 = $.from_html(`<div><!> <div class="inner svelte-ol42oa"><!></div> <!> <!></div>`);

export default function Preview($$anchor, $$props) {
	$.push($$props, true);

	const // svelte-ignore state_referenced_locally TODO
	valuePreview = ($$anchor, value = $.noop, key = $.noop) => {
		const valType = $.derived(() => getType(value(), options.value.stores));
		const newPath = $.derived(() => $$props.path && key() ? [...$$props.path, key()] : undefined);
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				Node($$anchor, {
					get path() {
						return $$props.path;
					},

					get key() {
						return key();
					},

					get value() {
						return value();
					},

					get showKey() {
						return showKey();
					},

					get keyDelim() {
						return keyDelim();
					},

					get keyStyle() {
						return keyStyle();
					},

					get usedefaults() {
						return $$props.usedefaults;
					}
				});
			};

			var d = $.derived(() => alwaysRender($.get(valType)) || previewLevel < $.get(previewDepth));

			var alternate = ($$anchor) => {
				var div = root();
				var node_1 = $.child(div);

				{
					var consequent_1 = ($$anchor) => {
						Key($$anchor, {
							disabled: true,
							get path() {
								return $.get(newPath);
							},

							get key() {
								return key();
							},

							get delim() {
								return keyDelim();
							},

							get style() {
								return keyStyle();
							},
							allowUndefined: true
						});
					};

					$.if(node_1, ($$render) => {
						if (showKey()) $$render(consequent_1);
					});
				}

				var node_2 = $.sibling(node_1, 2);

				Type(node_2, {
					get type() {
						return $.get(valType);
					},
					force: true
				});

				$.reset(div);
				$.append($$anchor, div);
			};

			$.if(node, ($$render) => {
				if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	const previewValue = ($$anchor, key = $.noop, $$arg1, descriptor = $.noop) => {
		let _force = $.derived_safe_equal(() => $.fallback($$arg1?.(), false));
		var fragment_3 = $.comment();
		var node_3 = $.first_child(fragment_3);

		{
			var consequent_2 = ($$anchor) => {
				GetterSetter($$anchor, {
					get key() {
						return key();
					},

					get descriptor() {
						return descriptor();
					},

					get value() {
						return $$props.value;
					},

					get path() {
						return $$props.path;
					}
				});
			};

			var alternate_1 = ($$anchor) => {
				valuePreview($$anchor, () => $$props.value?.[key()], key);
			};

			$.if(node_3, ($$render) => {
				if (descriptor()?.set || descriptor()?.get) $$render(consequent_2); else $$render(alternate_1, -1);
			});
		}

		$.append($$anchor, fragment_3);
	};

	let showKey = $.prop($$props, 'showKey', 3, true),
		keyDelim = $.prop($$props, 'keyDelim', 3, ':'),
		keyStyle = $.prop($$props, 'keyStyle', 3, ''),
		startLevel = $.prop($$props, 'startLevel', 3, 1),
		showPreview = $.prop($$props, 'showPreview', 3, false),
		bracketStyle = $.prop($$props, 'bracketStyle', 3, ''),
		rest = $.rest_props($$props, rest_excludes);

	const previewLevel = getContext(Symbol.for('siv.preview-level')) ?? startLevel();
	const options = useOptions();

	let $$d = $.derived(() => options.value),
		previewEntries = $.derived(() => $.get($$d).previewEntries),
		previewDepth = $.derived(() => $.get($$d).previewDepth),
		optsShowPreview = $.derived(() => $.get($$d).showPreview),
		easing = $.derived(() => $.get($$d).easing);

	setContext(Symbol.for('siv.preview-level'), (previewLevel ?? 0) + 1);

	let list = $.derived(() => $$props.list?.slice(0, $.get(previewEntries)));
	let keyValue = $.derived(() => $$props.keyValue?.slice(0, $.get(previewEntries)));
	let keys = $.derived(() => $$props.keys?.slice(0, $.get(previewEntries)));

	let hasMore = $.derived(() => {
		if ($.get(list) && $$props.list) {
			return $.get(list).length < $$props.list.length;
		} else if ($.get(keyValue) && $$props.keyValue) {
			return $.get(keyValue).length < $$props.keyValue.length;
		} else if ($.get(keys) && $$props.keys) {
			return $.get(keys).length < $$props.keys.length;
		}

		return false;
	});

	function alwaysRender(type) {
		return [
			'boolean',
			'string',
			'number',
			'bigint',
			'symbol',
			'regexp',
			'class',
			'undefined',
			'null',
			'store'
		].includes(type);
	}

	var fragment_6 = $.comment();
	var node_4 = $.first_child(fragment_6);

	{
		var consequent_13 = ($$anchor) => {
			var fragment_7 = $.comment();
			var node_5 = $.first_child(fragment_7);

			{
				const failed = ($$anchor, _ = $.noop, reset = $.noop) => {
					$.next();

					var fragment_8 = root_2();
					var node_6 = $.sibling($.first_child(fragment_8));

					NodeActionButton(node_6, {
						get onclick() {
							return reset();
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('reset');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_8);
				};

				$.boundary(node_5, { onerror: (e) => console.error('preview failed:', e), failed }, ($$anchor) => {
					var div_1 = root_6();

					$.attribute_effect(
						div_1,
						() => ({
							'data-testid': 'preview',
							class: ['preview', $$props.class],
							...rest
						}),
						void 0,
						void 0,
						void 0,
						'svelte-ol42oa'
					);

					var node_7 = $.child(div_1);

					{
						var consequent_3 = ($$anchor) => {
							var span_1 = root_3();
							var text_1 = $.only_child(span_1, true);

							$.template_effect(() => {
								$.set_class(span_1, 1, `pre level-${previewLevel ?? ''}`, 'svelte-ol42oa');
								$.set_style(span_1, bracketStyle());
								$.set_text(text_1, $$props.prefix);
							});

							$.append($$anchor, span_1);
						};

						$.if(node_7, ($$render) => {
							if ($$props.prefix) $$render(consequent_3);
						});
					}

					var div_2 = $.sibling(node_7, 2);
					var node_8 = $.child(div_2);

					{
						var consequent_5 = ($$anchor) => {
							var fragment_9 = $.comment();
							var node_9 = $.first_child(fragment_9);

							$.each(node_9, 17, () => $.get(keys), $.index, ($$anchor, key, i) => {
								const descriptor = $.derived(() => getPropertyDescriptor($$props.value, $.get(key)));
								var fragment_10 = root_4();
								var node_10 = $.first_child(fragment_10);

								previewValue(node_10, () => $.get(key), () => false, () => $.get(descriptor));

								var node_11 = $.sibling(node_10);

								{
									var consequent_4 = ($$anchor) => {
										comma($$anchor);
									};

									$.if(node_11, ($$render) => {
										if (i < $.get(keys).length - 1) $$render(consequent_4);
									});
								}

								$.append($$anchor, fragment_10);
							});

							$.append($$anchor, fragment_9);
						};

						var consequent_7 = ($$anchor) => {
							var fragment_12 = $.comment();
							var node_12 = $.first_child(fragment_12);

							$.each(node_12, 19, () => $.get(keyValue), ([key, value]) => key, ($$anchor, $$item, i, $$array) => {
								var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
								let key = () => $.get($$array_1)[0];
								let value = () => $.get($$array_1)[1];
								var fragment_13 = root_4();
								var node_13 = $.first_child(fragment_13);

								valuePreview(node_13, value, key);

								var node_14 = $.sibling(node_13);

								{
									var consequent_6 = ($$anchor) => {
										comma($$anchor);
									};

									$.if(node_14, ($$render) => {
										if ($.get(i) < $.get(keyValue).length - 1) $$render(consequent_6);
									});
								}

								$.append($$anchor, fragment_13);
							});

							$.append($$anchor, fragment_12);
						};

						var consequent_9 = ($$anchor) => {
							var fragment_15 = $.comment();
							var node_15 = $.first_child(fragment_15);

							$.each(node_15, 17, () => $.get(list), $.index, ($$anchor, value, i, $$array_2) => {
								var fragment_16 = root_4();
								var node_16 = $.first_child(fragment_16);

								valuePreview(node_16, () => $.get(value), () => i);

								var node_17 = $.sibling(node_16);

								{
									var consequent_8 = ($$anchor) => {
										comma($$anchor);
									};

									$.if(node_17, ($$render) => {
										if (i < $.get(list).length - 1) $$render(consequent_8);
									});
								}

								$.append($$anchor, fragment_16);
							});

							$.append($$anchor, fragment_15);
						};

						var consequent_10 = ($$anchor) => {
							valuePreview($$anchor, () => $$props.singleValue.value, () => undefined);
						};

						$.if(node_8, ($$render) => {
							if ($.get(keys) && $$props.value) $$render(consequent_5); else if ($.get(keyValue)) $$render(consequent_7, 1); else if ($.get(list)) $$render(consequent_9, 2); else if ($$props.singleValue) $$render(consequent_10, 3);
						});
					}

					$.reset(div_2);

					var node_18 = $.sibling(div_2, 2);

					{
						var consequent_11 = ($$anchor) => {
							var fragment_19 = root_5();
							var node_19 = $.first_child(fragment_19);

							comma(node_19);
							$.next();
							$.append($$anchor, fragment_19);
						};

						$.if(node_18, ($$render) => {
							if ($.get(hasMore)) $$render(consequent_11);
						});
					}

					var node_20 = $.sibling(node_18, 2);

					{
						var consequent_12 = ($$anchor) => {
							var span_2 = root_3();
							var text_2 = $.only_child(span_2, true);

							$.template_effect(() => {
								$.set_class(span_2, 1, `post level-${previewLevel ?? ''}`, 'svelte-ol42oa');
								$.set_style(span_2, bracketStyle());
								$.set_text(text_2, $$props.postfix);
							});

							$.append($$anchor, span_2);
						};

						$.if(node_20, ($$render) => {
							if ($$props.postfix) $$render(consequent_12);
						});
					}

					$.reset(div_1);

					$.transition(3, div_2, () => fly, () => ({
						y: 20,
						duration: options.transitionDuration,
						easing: $.get(easing)
					}));

					$.transition(3, div_1, () => slide, () => ({
						axis: 'x',
						duration: options.transitionDuration,
						easing: $.get(easing)
					}));

					$.append($$anchor, div_1);
				});
			}

			$.append($$anchor, fragment_7);
		};

		$.if(node_4, ($$render) => {
			if ($.get(optsShowPreview) && $.get(previewEntries) > 0 && showPreview()) $$render(consequent_13);
		});
	}

	$.append($$anchor, fragment_6);
	$.pop();
}