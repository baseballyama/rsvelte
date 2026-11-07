import * as $ from 'svelte/internal/server';
import { AutoValue, Element, Folder, Pane } from 'svelte-tweakpane-ui';
import HorizontalButtonGroup from '../../components/HorizontalButtonGroup.svelte';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import { staticStateMetaKey } from '../../config.js';
import { useStudio } from '../../internal/extensions.js';
import { clientRpc } from '../../rpc/clientRpc.js';
import { accessors, instances, setValue, StaticState } from './StaticState.js';
import { staticStateScope } from './types.js';

export default function StaticState_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
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

		ToolbarItem($$renderer, {
			position: 'left',
			children: ($$renderer) => {
				HorizontalButtonGroup($$renderer, {
					children: ($$renderer) => {
						ToolbarButton($$renderer, {
							onclick: extension.toggleEditor,
							active: extension.state.editorEnabled,
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

		$$renderer.push(`<!----> `);

		if (extension.state.editorEnabled) {
			$$renderer.push('<!--[0-->');

			Pane($$renderer, {
				title: 'Static State',
				position: 'fixed',
				width: 320,
				x: browser ? innerWidth - 6 - 320 : 6,
				y: 6 + 60 + 6,
				children: ($$renderer) => {
					if (hasStates()) {
						$$renderer.push(`<!--[0--><!--[-->`);

						const each_array = $.ensure_array_like(StaticState[instances].entries());

						for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
							let [constructor, ix] = each_array[$$index_1];

							if (ix.size > 0) {
								$$renderer.push('<!--[0-->');

								Folder($$renderer, {
									title: constructor.name,
									children: ($$renderer) => {
										const [instance] = ix;

										$$renderer.push(`<!--[-->`);

										const each_array_1 = $.ensure_array_like(instance[accessors]);

										for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
											let accessor = each_array_1[$$index];

											AutoValue($$renderer, $.spread_props([
												{ value: getValue(instance, accessor), label: accessor },
												buildAutoValueOptions(instance, accessor)
											]));
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');

						Element($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<div class="svelte-18vlkpt"><p>No static states found</p></div>`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}