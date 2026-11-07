import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Expandable from './Expandable.svelte';
import GetterSetter from './GetterSetter.svelte';
import Highlight from './Highlight.svelte';
import Node from './Node.svelte';
import PropertyList from './PropertyList.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'key',
	'type',
	'path'
]);

export default function RegexpView($$anchor, $$props) {
	$.push($$props, true);

	let key = $.prop($$props, 'key', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	let keys = [
		'lastIndex',
		'dotAll',
		'flags',
		'global',
		'hasIndices',
		'ignoreCase',
		'multiline',
		'source',
		'sticky',
		'unicode',
		'unicodeSets'
	];

	{
		const valuePreview = ($$anchor) => {
			{
				let $0 = $.derived(() => $$props.value.toString());
				let $1 = $.derived(() => $$props.value.toString());

				Highlight($$anchor, {
					'data-testid': 'value',
					class: 'value regexp',
					get title() {
						return $.get($0);
					},

					get value() {
						return $.get($1);
					},
					fields: ['value']
				});
			}
		};

		Expandable($$anchor, $.spread_props(
			{
				length: 1,
				showLength: false,
				get type() {
					return $$props.type;
				},

				get key() {
					return key();
				},

				get path() {
					return $$props.path;
				},

				get value() {
					return $$props.value;
				}
			},
			() => rest,
			{
				keepPreviewOnExpand: true,
				valuePreview,
				children: ($$anchor, $$slotProps) => {
					{
						const item = ($$anchor, $$arg0) => {
							let key = () => ($$arg0?.()).key;
							let descriptor = () => ($$arg0?.()).descriptor;
							var fragment_3 = $.comment();
							var node = $.first_child(fragment_3);

							{
								var consequent = ($$anchor) => {
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
									Node($$anchor, {
										get value() {
											return $$props.value[key()];
										},

										get key() {
											return key();
										},

										get path() {
											return $$props.path;
										}
									});
								};

								$.if(node, ($$render) => {
									if (descriptor()?.get || descriptor()?.set) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_3);
						};

						PropertyList($$anchor, {
							get keys() {
								return keys;
							},

							get value() {
								return $$props.value;
							},

							get type() {
								return $$props.type;
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