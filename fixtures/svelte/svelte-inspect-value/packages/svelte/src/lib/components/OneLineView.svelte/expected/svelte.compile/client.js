import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getIsKey, getPreviewLevel } from '../contexts.js';
import { useOptions } from '../options.svelte.js';
import Bullet from './Bullet.svelte';
import Count from './Count.svelte';
import Highlight from './Highlight.svelte';
import Key from './Key.svelte';
import NodeNote from './NodeNote.svelte';
import Row from './Row.svelte';
import Tools from './Tools.svelte';
import Type from './Type.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'display',
	'key',
	'showKey',
	'keyDelim',
	'keyPrefix',
	'keyStyle',
	'type',
	'forceType',
	'path',
	'length',
	'showLength',
	'note',
	'match',
	'children'
]);

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div><!> <!></div>`);

export default function OneLineView($$anchor, $$props) {
	$.push($$props, true);

	let showKey = $.prop($$props, 'showKey', 3, true),
		keyDelim = $.prop($$props, 'keyDelim', 3, ':'),
		showLength = $.prop($$props, 'showLength', 3, true),
		rest = $.rest_props($$props, rest_excludes);

	const options = useOptions();

	const $$d = $.derived(() => options.value),
		borderless = $.derived(() => $.get($$d).borderless),
		optsShowLength = $.derived(() => $.get($$d).showLength);

	let previewLevel = getPreviewLevel();
	let isKey = getIsKey();
	let displayOrValue = $.derived(() => $$props.display != null ? $$props.display : $$props.value?.toString?.() ?? '');

	let title = $.derived(() => typeof $$props.value === 'string'
		? $$props.value
		: $$props.display != null ? $$props.display : $$props.value?.toString());

	var div = root_1();

	$.attribute_effect(div, () => ({
		'data-testid': 'line',
		class: [
			'line',
			$$props.match && 'match',
			(previewLevel || isKey) && 'preview',
			!showKey() && 'nokey'
		],
		...rest
	}));

	var node = $.child(div);

	{
		let $0 = $.derived(() => previewLevel === 0);

		Row(node, {
			collapsed: true,
			disabled: true,
			get isFocusTarget() {
				return $.get($0);
			},

			get previewLevel() {
				return previewLevel;
			},

			get borderless() {
				return $.get(borderless);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				{
					var consequent = ($$anchor) => {
						Bullet($$anchor, {
							get value() {
								return $$props.value;
							}
						});
					};

					$.if(node_1, ($$render) => {
						if (!previewLevel && !isKey) $$render(consequent);
					});
				}

				var node_2 = $.sibling(node_1, 2);

				{
					var consequent_1 = ($$anchor) => {
						Key($$anchor, {
							disabled: true,
							get prefix() {
								return $$props.keyPrefix;
							},

							get delim() {
								return keyDelim();
							},

							get style() {
								return $$props.keyStyle;
							},

							get key() {
								return $$props.key;
							},

							get path() {
								return $$props.path;
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
								return $$props.forceType;
							}
						});
					};

					$.if(node_3, ($$render) => {
						if (!isKey) $$render(consequent_2);
					});
				}

				var node_4 = $.sibling(node_3, 2);

				{
					var consequent_3 = ($$anchor) => {
						var fragment_4 = $.comment();
						var node_5 = $.first_child(fragment_4);

						$.snippet(node_5, () => $$props.children);
						$.append($$anchor, fragment_4);
					};

					var consequent_4 = ($$anchor) => {
						{
							let $0 = $.derived(() => ['value', $$props.type]);

							Highlight($$anchor, {
								'data-testid': 'value',
								get title() {
									return $.get(title);
								},

								get class() {
									return $.get($0);
								},

								get value() {
									return $.get(displayOrValue);
								},
								fields: ['value']
							});
						}
					};

					$.if(node_4, ($$render) => {
						if ($$props.children) $$render(consequent_3); else if ($.get(displayOrValue)) $$render(consequent_4, 1);
					});
				}

				var node_6 = $.sibling(node_4, 2);

				{
					var consequent_5 = ($$anchor) => {
						NodeNote($$anchor, {
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

					$.if(node_6, ($$render) => {
						if ($$props.note && !previewLevel) $$render(consequent_5);
					});
				}

				var node_7 = $.sibling(node_6, 2);

				{
					var consequent_6 = ($$anchor) => {
						Count($$anchor, {
							get length() {
								return $$props.length;
							},

							get type() {
								return $$props.type;
							}
						});
					};

					$.if(node_7, ($$render) => {
						if (typeof $$props.length === 'number' && showLength() && $.get(optsShowLength) && !previewLevel) $$render(consequent_6);
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	var node_8 = $.sibling(node, 2);

	{
		var consequent_7 = ($$anchor) => {
			Tools($$anchor, {
				get value() {
					return $$props.value;
				},

				get path() {
					return $$props.path;
				},

				get type() {
					return $$props.type;
				}
			});
		};

		$.if(node_8, ($$render) => {
			if (!isKey && !previewLevel) $$render(consequent_7);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}