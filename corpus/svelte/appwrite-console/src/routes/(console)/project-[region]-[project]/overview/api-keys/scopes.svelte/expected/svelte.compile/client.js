import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { isCloud } from '$lib/system';
import { Button } from '$lib/elements/forms';
import { symmetricDifference } from '$lib/helpers/array';
import { cloudOnlyBackupScopes, scopes as localScopes } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';

import {
	Accordion,
	Alert,
	Badge,
	Divider,
	Layout,
	Selector,
	Typography
} from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <span><!></span> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<label class="svelte-1poxvtl"><!></label>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Scopes($$anchor, $$props) {
	$.push($$props, true);

	let scopes = $.prop($$props, 'scopes', 31, () => $.proxy([]));
	let allScopesList = $.state($.proxy([]));
	let mounted = $.state(false);
	let loadError = $.state(null);
	const categoryAliasMap = { Database: 'Databases' };

	function normalizeCategory(category) {
		return categoryAliasMap[category] ?? category;
	}

	const filteredScopes = $.derived(() => {
		const scopesById = new Map($.get(allScopesList).map((scope) => [scope.scope, scope]));
		const databasesWriteIndex = $.get(allScopesList).findIndex((s) => s.scope === 'databases.write');

		if (isCloud && databasesWriteIndex !== -1) {
			const normalizedBackupScopes = cloudOnlyBackupScopes.map((scope) => ({ ...scope, category: normalizeCategory(scope.category) }));
			const backupScopeIds = new Set(normalizedBackupScopes.map((scope) => scope.scope));

			for (const scope of normalizedBackupScopes) {
				if (!scopesById.has(scope.scope)) {
					scopesById.set(scope.scope, scope);
				}
			}

			const mergedScopes = Array.from(scopesById.values());
			const nonBackupScopes = mergedScopes.filter((scope) => !backupScopeIds.has(scope.scope));
			const mergedDatabasesWriteIndex = nonBackupScopes.findIndex((s) => s.scope === 'databases.write');

			return [
				...nonBackupScopes.slice(0, mergedDatabasesWriteIndex + 1),
				...normalizedBackupScopes.map((scope) => scopesById.get(scope.scope) ?? scope),
				...nonBackupScopes.slice(mergedDatabasesWriteIndex + 1)
			];
		}

		return $.get(allScopesList);
	});

	const categories = $.derived(() => {
		return Array.from(new Set($.get(filteredScopes).map((scope) => normalizeCategory(scope.category))));
	});

	const scopeCatalog = $.derived(() => new Set($.get(filteredScopes).map((s) => s.scope)));
	let activeScopes = $.proxy({});

	$.user_effect(() => {
		if ($.get(mounted)) {
			const newScopes = generateSyncedScopes(activeScopes);

			if (symmetricDifference(scopes(), newScopes).length) {
				scopes(newScopes);
			}
		}
	});

	onMount(async () => {
		try {
			const result = await sdk.forConsole.console.listProjectScopes();
			const scopesById = new Map();

			for (const scope of result.scopes) {
				scopesById.set(scope.$id, {
					scope: scope.$id,
					description: scope.description,
					category: normalizeCategory(scope.category),
					deprecated: scope.deprecated,
					icon: ''
				});
			}

			for (const scope of localScopes) {
				if (!scopesById.has(scope.scope)) {
					scopesById.set(scope.scope, { ...scope, category: normalizeCategory(scope.category) });
				}
			}

			$.set(allScopesList, Array.from(scopesById.values()), true);

			const selectedScopes = new Set(scopes());

			for (const s of $.get(filteredScopes)) {
				activeScopes[s.scope] = selectedScopes.has(s.scope);
			}

			$.set(mounted, true);
		} catch(e) {
			$.set(loadError, e?.message ?? 'Failed to load available scopes.', true);

			// mounted intentionally stays false — the $effect guards on it,
			// so leaving it false prevents activeScopes = {} from overwriting
			// the parent-bound scopes prop with an empty array on fetch failure.
		}
	});

	function selectAll() {
		for (const scope in activeScopes) {
			activeScopes[scope] = true;
		}
	}

	function deselectAll() {
		for (const scope in activeScopes) {
			activeScopes[scope] = false;
		}
	}

	function categoryState(category, s) {
		const scopesByCategory = $.get(filteredScopes).filter((n) => n.category === category);
		const scopeSet = new Set(s);
		const activeInCategory = scopesByCategory.filter((scopeItem) => scopeSet.has(scopeItem.scope));

		if (activeInCategory.length === 0) {
			return false;
		} else if (activeInCategory.length === scopesByCategory.length) {
			return true;
		}

		return 'indeterminate';
	}

	function onCategoryChange(event, category) {
		const { detail } = event;

		if (detail === 'indeterminate') return;

		$.get(filteredScopes).forEach((s) => {
			if (s.category === category) {
				activeScopes[s.scope] = detail;
			}
		});
	}

	function generateSyncedScopes(activeScopesObj) {
		return Object.entries(activeScopesObj).filter(([scope, isActive]) => isActive && $.get(scopeCatalog).has(scope)).map(([scope]) => scope);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Alert.Inline, ($$anchor, Alert_Inline) => {
							Alert_Inline($$anchor, {
								status: 'error',
								title: 'Failed to load scopes',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, $.get(loadError)));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					};

					$.if(node_1, ($$render) => {
						if ($.get(loadError)) $$render(consequent);
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
					Layout_Stack_1($$anchor, {
						direction: 'row',
						alignItems: 'center',
						gap: 's',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_4 = $.first_child(fragment_4);

							Button(node_4, {
								compact: true,
								$$events: { click: selectAll },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Select all');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var span = $.sibling(node_4, 2);

							$.set_style(span, '', {}, { height: '20px' });

							var node_5 = $.child(span);

							Divider(node_5, { vertical: true });
							$.reset(span);

							var node_6 = $.sibling(span, 2);

							Button(node_6, {
								compact: true,
								$$events: { click: deselectAll },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Deselect all');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_3, 2);

				$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
					Layout_Stack_2($$anchor, {
						gap: 'none',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var node_8 = $.first_child(fragment_5);

							Divider(node_8, {});

							var node_9 = $.sibling(node_8, 2);

							$.each(node_9, 17, () => $.get(categories), $.index, ($$anchor, category, index) => {
								const checked = $.derived(() => categoryState($.get(category), scopes()));
								const isLastItem = $.derived(() => index === $.get(categories).length - 1);
								const scopesLength = $.derived(() => $.get(filteredScopes).filter((n) => n.category === $.get(category) && activeScopes[n.scope]).length);

								{
									let $0 = $.derived(() => `${$.get(scopesLength)} ${$.get(scopesLength) === 1 ? 'Scope' : 'Scopes'}`);

									Accordion($$anchor, {
										selectable: true,
										get title() {
											return $.get(category);
										},

										get hideDivider() {
											return $.get(isLastItem);
										},

										get badge() {
											return $.get($0);
										},

										get checked() {
											return $.get(checked);
										},
										$$events: { change: (event) => onCategoryChange(event, $.get(category)) },
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = $.comment();
											var node_10 = $.first_child(fragment_7);

											$.component(node_10, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
												Layout_Stack_3($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = $.comment();
														var node_11 = $.first_child(fragment_8);

														$.each(node_11, 17, () => $.get(filteredScopes).filter((s) => s.category === $.get(category)), $.index, ($$anchor, scope) => {
															var fragment_9 = $.comment();
															var node_12 = $.first_child(fragment_9);

															$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																Layout_Stack_4($$anchor, {
																	inline: true,
																	direction: 'row',
																	alignItems: 'flex-start',
																	gap: 's',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = root_1();
																		var node_13 = $.first_child(fragment_10);

																		$.component(node_13, () => Selector.Checkbox, ($$anchor, Selector_Checkbox) => {
																			Selector_Checkbox($$anchor, {
																				size: 's',
																				get id() {
																					return $.get(scope).scope;
																				},

																				get checked() {
																					return activeScopes[$.get(scope).scope];
																				},

																				set checked($$value) {
																					activeScopes[$.get(scope).scope] = $$value;
																				}
																			});
																		});

																		var node_14 = $.sibling(node_13, 2);

																		$.component(node_14, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
																			Layout_Stack_5($$anchor, {
																				gap: 'xxs',
																				children: ($$anchor, $$slotProps) => {
																					var label = root_2();
																					var node_15 = $.child(label);

																					$.component(node_15, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
																						Layout_Stack_6($$anchor, {
																							gap: 'xxs',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_11 = root_1();
																								var node_16 = $.first_child(fragment_11);

																								$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
																									Layout_Stack_7($$anchor, {
																										inline: true,
																										direction: 'row',
																										alignItems: 'center',
																										gap: 'xxs',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_12 = root_1();
																											var node_17 = $.first_child(fragment_12);

																											$.component(node_17, () => Typography.Text, ($$anchor, Typography_Text) => {
																												Typography_Text($$anchor, {
																													variant: 'm-500',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_3 = $.text();

																														$.template_effect(() => $.set_text(text_3, $.get(scope).scope));
																														$.append($$anchor, text_3);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_18 = $.sibling(node_17, 2);

																											{
																												var consequent_1 = ($$anchor) => {
																													Badge($$anchor, { size: 'xs', variant: 'secondary', content: 'Deprecated' });
																												};

																												$.if(node_18, ($$render) => {
																													if ($.get(scope).deprecated) $$render(consequent_1);
																												});
																											}

																											$.append($$anchor, fragment_12);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_19 = $.sibling(node_16, 2);

																								$.component(node_19, () => Typography.Text, ($$anchor, Typography_Text_1) => {
																									Typography_Text_1($$anchor, {
																										variant: 'm-400',
																										color: '--fgcolor-neutral-tertiary',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_4 = $.text();

																											$.template_effect(() => $.set_text(text_4, $.get(scope).description));
																											$.append($$anchor, text_4);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_11);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.reset(label);
																					$.template_effect(() => $.set_attribute(label, 'for', $.get(scope).scope));
																					$.append($$anchor, label);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_10);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_9);
														});

														$.append($$anchor, fragment_8);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});
								}
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}