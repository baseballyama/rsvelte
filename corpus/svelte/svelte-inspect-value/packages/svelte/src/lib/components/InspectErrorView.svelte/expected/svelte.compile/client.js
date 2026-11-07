import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, setContext } from 'svelte';
import { InspectError } from '../types.js';
import Expandable from './Expandable.svelte';
import GetterSetter from './GetterSetter.svelte';
import Node from './Node.svelte';
import NodeActionButton from './NodeActionButton.svelte';
import PropertyList from './PropertyList.svelte';
import StringValue from './StringValue.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function InspectErrorView($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 19, () => new InspectError('')),
		type = $.prop($$props, 'type', 3, 'InspectError');

	setContext(Symbol.for('siv.use-defaults'), true);

	const depth = getContext(Symbol.for('siv.error-depth')) ?? 0;

	setContext(Symbol.for('siv.error-depth'), depth + 1);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			{
				const valuePreview = ($$anchor) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					NodeActionButton(node_1, {
						get onclick() {
							return $$props.reset;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('RESET');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					StringValue(node_2, {
						type: 'error',
						get value() {
							return value().message;
						}
					});

					$.append($$anchor, fragment_2);
				};

				Expandable($$anchor, {
					get value() {
						return value();
					},

					get key() {
						return $$props.key;
					},

					get keyPrefix() {
						return $$props.keyPrefix;
					},

					get path() {
						return $$props.path;
					},

					get type() {
						return type();
					},
					length: 4,
					showLength: false,
					keepPreviewOnExpand: true,
					valuePreview,
					children: ($$anchor, $$slotProps) => {
						{
							const item = ($$anchor, $$arg0) => {
								let key = () => ($$arg0?.()).key;
								let descriptor = () => ($$arg0?.()).descriptor;
								var fragment_4 = $.comment();
								var node_3 = $.first_child(fragment_4);

								{
									var consequent = ($$anchor) => {
										GetterSetter($$anchor, {
											get value() {
												return value();
											},

											get descriptor() {
												return descriptor();
											},

											get key() {
												return key();
											},

											get path() {
												return $$props.path;
											},
											usedefaults: true
										});
									};

									var alternate = ($$anchor) => {
										Node($$anchor, {
											get value() {
												return value()[key()];
											},

											get key() {
												return key();
											},

											get path() {
												return $$props.path;
											},
											usedefaults: true
										});
									};

									$.if(node_3, ($$render) => {
										if (descriptor()?.get || descriptor()?.set) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_4);
							};

							PropertyList($$anchor, {
								get value() {
									return value();
								},
								keys: ['message', 'value', 'cause', 'stack'],
								item,
								$$slots: { item: true }
							});
						}
					},
					$$slots: { valuePreview: true, default: true }
				});
			}
		};

		var alternate_1 = ($$anchor) => {
			var text_1 = $.text('max error depth exceeded');

			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if (depth <= 3) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}