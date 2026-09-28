import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { scope } from '../attachments/focus.js';
import { getIsKey, getPreviewLevel } from '../contexts.js';
import { useOptions } from '../options.svelte.js';
import { useState } from '../state.svelte.js';
import { slideXY } from '../transition/index.js';
import { neverExpandInitial, shouldInitiallyExpandNode, stringifyPath } from '../util.js';
import CollapseButton from './CollapseButton.svelte';
import Count from './Count.svelte';
import Key from './Key.svelte';
import NodeNote from './NodeNote.svelte';
import Row from './Row.svelte';
import Tools from './Tools.svelte';
import Type from './Type.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'key',
	'keyPrefix',
	'keyDelim',
	'keyStyle',
	'showKey',
	'type',
	'length',
	'value',
	'valuePreview',
	'forceType',
	'keepPreviewOnExpand',
	'path',
	'showLength',
	'children',
	'note',
	'match'
]);

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div role="list" data-testid="indent"><!></div>`);
var root_2 = $.from_html(`<div><!> <!></div> <!>`, 1);

export default function Expandable($$anchor, $$props) {
	$.push($$props, true);

	let keyDelim = $.prop($$props, 'keyDelim', 3, ':'),
		showKey = $.prop($$props, 'showKey', 3, true),
		forceType = $.prop($$props, 'forceType', 3, false),
		keepPreviewOnExpand = $.prop($$props, 'keepPreviewOnExpand', 3, false),
		path = $.prop($$props, 'path', 19, () => []),
		showLength = $.prop($$props, 'showLength', 3, true),
		rest = $.rest_props($$props, rest_excludes);

	let collapseButton = $.state(void 0);
	const options = useOptions();
	const inspectState = useState();
	const previewLevel = getPreviewLevel();
	const isKey = getIsKey();

	let $$d = $.derived(() => options.value),
		expandAll = $.derived(() => $.get($$d).expandAll),
		expandPaths = $.derived(() => $.get($$d).expandPaths),
		optsShowLength = $.derived(() => $.get($$d).showLength),
		borderless = $.derived(() => $.get($$d).borderless),
		easing = $.derived(() => $.get($$d).easing);

	let expandingDisabled = $.derived(() => $$props.length === 0 || previewLevel > 0);
	let stringifiedPath = $.derived(() => stringifyPath(path()));
	let collapseState = $.derived(() => inspectState.value[$.get(stringifiedPath)]);

	let collapsed = $.derived(() => {
		if (previewLevel || !$$props.length) return true;

		if ($.get(collapseState)) {
			return $.get(collapseState).collapsed;
		}

		// while waiting for onMount to run, check expandLevel.
		// this avoids playing the indent intro animation.
		return path().length > options.expandLevel || neverExpandInitial.includes($$props.key);
	});

	onMount(() => {
		if (previewLevel) return;

		if (inspectState && previewLevel === 0) {
			const storedState = inspectState.getCollapse(path());

			if (!storedState) {
				inspectState.setCollapse(path(), {
					collapsed: !shouldInitiallyExpandNode(path(), options.expandLevel, $.get(expandAll), $.get(expandPaths))
				});
			}
		}
	});

	function setCollapse(collapsed) {
		if (!$.get(expandingDisabled)) {
			inspectState.setCollapse($.get(stringifiedPath), { collapsed });
		}
	}

	let shouldRenderChildren = $.derived(() => {
		if ($$props.match && $$props.type !== 'string' && $$props.type !== 'function') {
			return $$props.length != null && $$props.length > 0 && !previewLevel;
		} else {
			return $$props.length != null && $$props.length > 0 && !$.get(collapsed) && !previewLevel;
		}
	});

	function flash() {
		$.get(collapseButton)?.flashButton();
	}

	var $$exports = { flash };
	var fragment = root_2();
	var div = $.first_child(fragment);

	$.attribute_effect(
		div,
		() => ({
			'data-testid': 'expandable',
			class: [
				'line',
				previewLevel && 'preview',
				!showKey() && 'nokey',
				$$props.match && 'match'
			],
			'aria-expanded': !$.get(collapsed),
			...rest
		}),
		void 0,
		void 0,
		void 0,
		'svelte-cc7f82'
	);

	var node = $.child(div);

	{
		let $0 = $.derived(() => previewLevel === 0);

		Row(node, {
			get collapsed() {
				return $.get(collapsed);
			},

			get previewLevel() {
				return previewLevel;
			},

			get borderless() {
				return $.get(borderless);
			},

			get disabled() {
				return $.get(expandingDisabled);
			},
			onchange: setCollapse,
			get isFocusTarget() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						$.bind_this(
							CollapseButton($$anchor, {
								get collapsed() {
									return $.get(collapsed);
								},

								get value() {
									return $$props.value;
								},

								get key() {
									return $$props.key;
								},

								get type() {
									return $$props.type;
								},

								get disabled() {
									return $.get(expandingDisabled);
								}
							}),
							($$value) => $.set(collapseButton, $$value, true),
							() => $.get(collapseButton)
						);
					};

					$.if(node_1, ($$render) => {
						if (!previewLevel && !isKey) $$render(consequent);
					});
				}

				var node_2 = $.sibling(node_1, 2);

				{
					var consequent_1 = ($$anchor) => {
						Key($$anchor, {
							get disabled() {
								return $.get(expandingDisabled);
							},

							get delim() {
								return keyDelim();
							},

							get prefix() {
								return $$props.keyPrefix;
							},

							get style() {
								return $$props.keyStyle;
							},

							get key() {
								return $$props.key;
							},

							get path() {
								return path();
							}
						});
					};

					$.if(node_2, ($$render) => {
						if (showKey()) $$render(consequent_1);
					});
				}

				var node_3 = $.sibling(node_2, 2);

				{
					var consequent_2 = ($$anchor) => {
						Type($$anchor, {
							get type() {
								return $$props.type;
							},

							get force() {
								return forceType();
							}
						});
					};

					$.if(node_3, ($$render) => {
						if (!isKey) $$render(consequent_2);
					});
				}

				var node_4 = $.sibling(node_3, 2);

				$.snippet(node_4, () => $$props.valuePreview, () => ({
					showPreview: $.get(collapsed) || previewLevel > 0 || keepPreviewOnExpand()
				}));

				var node_5 = $.sibling(node_4, 2);

				{
					var consequent_3 = ($$anchor) => {
						NodeNote($$anchor, {
							style: 'justify-self: right;',
							get title() {
								return $$props.note.description;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, $$props.note.title));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_5, ($$render) => {
						if ($$props.note && !previewLevel) $$render(consequent_3);
					});
				}

				var node_6 = $.sibling(node_5, 2);

				{
					var consequent_4 = ($$anchor) => {
						Count($$anchor, {
							get length() {
								return $$props.length;
							},

							get type() {
								return $$props.type;
							}
						});
					};

					$.if(node_6, ($$render) => {
						if (typeof $$props.length === 'number' && showLength() && $.get(optsShowLength) && !previewLevel) $$render(consequent_4);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	var node_7 = $.sibling(node, 2);

	{
		var consequent_5 = ($$anchor) => {
			Tools($$anchor, {
				get value() {
					return $$props.value;
				},

				get path() {
					return path();
				},

				get collapsed() {
					return $.get(collapsed);
				},

				get type() {
					return $$props.type;
				}
			});
		};

		$.if(node_7, ($$render) => {
			if (!previewLevel) $$render(consequent_5);
		});
	}

	$.reset(div);

	var node_8 = $.sibling(div, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_1 = root_1();
			var node_9 = $.child(div_1);

			$.snippet(node_9, () => $$props.children);
			$.reset(div_1);
			$.attach(div_1, () => scope(previewLevel === 0));
			$.template_effect(() => $.set_class(div_1, 1, $.clsx(['indent', $$props.type, $$props.match && 'match']), 'svelte-cc7f82'));
			$.event('inspectvaluechange', div_1, () => $.get(collapseButton)?.flash());
			$.transition(3, div_1, () => slideXY, () => ({ duration: options.transitionDuration, easing: $.get(easing) }));
			$.append($$anchor, div_1);
		};

		$.if(node_8, ($$render) => {
			if ($$props.children && $.get(shouldRenderChildren)) $$render(consequent_6);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}