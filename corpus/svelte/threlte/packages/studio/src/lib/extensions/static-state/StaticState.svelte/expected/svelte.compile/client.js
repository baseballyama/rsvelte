import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AutoValue, Element, Folder, Pane } from 'svelte-tweakpane-ui';
import HorizontalButtonGroup from '../../components/HorizontalButtonGroup.svelte';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import { staticStateMetaKey } from '../../config.js';
import { useStudio } from '../../internal/extensions.js';
import { clientRpc } from '../../rpc/clientRpc.js';
import { accessors, instances, setValue, StaticState } from './StaticState.js';
import { staticStateScope } from './types.js';

var root = $.from_html(`<div class="svelte-18vlkpt"><p>No static states found</p></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function StaticState_1($$anchor, $$props) {
	$.push($$props, true);

	const { createExtension } = useStudio();

	const extension = createExtension({
		scope: staticStateScope,
		state({ persist }) {
			return { editorEnabled: persist(false) };
		},

		actions: {
			toggleEditor({ state }) {
				state.editorEnabled = !state.editorEnabled;
			},

			enableEditor({ state }) {
				state.editorEnabled = true;
			},

			disableEditor({ state }) {
				state.editorEnabled = false;
			}
		}
	});

	const browser = typeof window !== 'undefined';

	const getValue = (state, accessor) => {
		return $.snapshot(state[accessor]);
	};

	let debounceTimeouts = {};

	/**
	 * Syncs the value back to the code. Debounced to prevent multiple calls.
	 */
	const syncValue = (moduleId, module, className, accessor, value) => {
		const debounceKey = `${moduleId}-${module}-${className}-${accessor}`;

		if (debounceTimeouts[debounceKey]) {
			clearTimeout(debounceTimeouts[debounceKey]);
		}

		debounceTimeouts[debounceKey] = setTimeout(
			() => {
				clientRpc?.mutateStaticState(moduleId, module, className, accessor, value);
				delete debounceTimeouts[debounceKey];
			},
			500
		);
	};

	const setStateValue = (state, accessor, value) => {
		StaticState[setValue](state.constructor, accessor, value);

		const className = state.constructor.name;

		syncValue(state[staticStateMetaKey].id, state[staticStateMetaKey].module, className, accessor, value);
	};

	const findModifiers = (state, accessor) => {
		const member = state[staticStateMetaKey].members.find((m) => m.name === accessor);

		if (!member) return [];

		return member.modifiers;
	};

	const buildOptionsFromModifiers = (modifiers) => {
		const options = {};

		modifiers.forEach((modifier) => {
			let v = modifier.value;

			try {
				v = JSON.parse(v);
			} catch {
				// ignore
			}

			options[modifier.name] = v;
		});

		return options;
	};

	const buildAutoValueOptions = (state, accessor) => {
		// In some rare cases, Svelte may provide an undefined state.
		if (!state) return {};

		const modifiers = findModifiers(state, accessor);
		const options = buildOptionsFromModifiers(modifiers);

		// must be any because of the way the AutoValue component works
		return { options };
	};

	const hasStates = $.derived(() => {
		return [...StaticState[instances]].some(([_, ix]) => ix.size > 0);
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	ToolbarItem(node, {
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			HorizontalButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					ToolbarButton($$anchor, {
						get onclick() {
							return extension.toggleEditor;
						},

						get active() {
							return extension.state.editorEnabled;
						},
						label: 'Static State',
						icon: 'mdiAppsBox',
						tooltip: 'Static State'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			{
				let $0 = $.derived(() => browser ? innerWidth - 6 - 320 : 6);

				Pane($$anchor, {
					title: 'Static State',
					position: 'fixed',
					width: 320,
					get x() {
						return $.get($0);
					},
					y: 6 + 60 + 6,
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = $.comment();
						var node_2 = $.first_child(fragment_4);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_5 = $.comment();
								var node_3 = $.first_child(fragment_5);

								$.each(node_3, 17, () => StaticState[instances].entries(), ([constructor, ix]) => constructor.name, ($$anchor, $$item) => {
									var $$array = $.derived(() => $.to_array($.get($$item), 2));
									let constructor = () => $.get($$array)[0];
									let ix = () => $.get($$array)[1];
									var fragment_6 = $.comment();
									var node_4 = $.first_child(fragment_6);

									{
										var consequent = ($$anchor) => {
											Folder($$anchor, {
												get title() {
													return constructor().name;
												},

												children: ($$anchor, $$slotProps) => {
													const computed_const = $.derived(() => {
														const [instance] = ix();

														return { instance };
													});

													var fragment_8 = $.comment();
													var node_5 = $.first_child(fragment_8);

													$.each(node_5, 16, () => $.get(computed_const).instance[accessors], (accessor) => accessor, ($$anchor, accessor) => {
														{
															let $0 = $.derived(() => getValue($.get(computed_const).instance, accessor));
															let $1 = $.derived(() => buildAutoValueOptions($.get(computed_const).instance, accessor));

															AutoValue($$anchor, $.spread_props(
																{
																	get value() {
																		return $.get($0);
																	},

																	get label() {
																		return accessor;
																	}
																},
																() => $.get($1),
																{
																	$$events: {
																		change: (e) => {
																			setStateValue($.get(computed_const).instance, accessor, e.detail.value);
																		}
																	}
																}
															));
														}
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										};

										$.if(node_4, ($$render) => {
											if (ix().size > 0) $$render(consequent);
										});
									}

									$.append($$anchor, fragment_6);
								});

								$.append($$anchor, fragment_5);
							};

							var alternate = ($$anchor) => {
								Element($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var div = root();

										$.append($$anchor, div);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_2, ($$render) => {
								if ($.get(hasStates)) $$render(consequent_1); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			}
		};

		$.if(node_1, ($$render) => {
			if (extension.state.editorEnabled) $$render(consequent_2);
		});
	}

	var node_6 = $.sibling(node_1, 2);

	$.snippet(node_6, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}