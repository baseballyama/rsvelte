import * as $ from 'svelte/internal/server';
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

export default function Scopes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { scopes = [] } = $$props;
		let allScopesList = [];
		let mounted = false;
		let loadError = null;
		const categoryAliasMap = { Database: 'Databases' };

		function normalizeCategory(category) {
			return categoryAliasMap[category] ?? category;
		}

		const filteredScopes = $.derived(() => {
			const scopesById = new Map(allScopesList.map((scope) => [scope.scope, scope]));
			const databasesWriteIndex = allScopesList.findIndex((s) => s.scope === 'databases.write');

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

			return allScopesList;
		});

		const categories = $.derived(() => {
			return Array.from(new Set(filteredScopes().map((scope) => normalizeCategory(scope.category))));
		});

		const scopeCatalog = $.derived(() => new Set(filteredScopes().map((s) => s.scope)));
		let activeScopes = {};

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

				allScopesList = Array.from(scopesById.values());

				const selectedScopes = new Set(scopes);

				for (const s of filteredScopes()) {
					activeScopes[s.scope] = selectedScopes.has(s.scope);
				}

				mounted = true;
			} catch(e) {
				loadError = e?.message ?? 'Failed to load available scopes.';

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
			const scopesByCategory = filteredScopes().filter((n) => n.category === category);
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

			filteredScopes().forEach((s) => {
				if (s.category === category) {
					activeScopes[s.scope] = detail;
				}
			});
		}

		function generateSyncedScopes(activeScopesObj) {
			return Object.entries(activeScopesObj).filter(([scope, isActive]) => isActive && scopeCatalog().has(scope)).map(([scope]) => scope);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					children: ($$renderer) => {
						if (loadError) {
							$$renderer.push('<!--[0-->');

							if (Alert.Inline) {
								$$renderer.push('<!--[-->');

								Alert.Inline($$renderer, {
									status: 'error',
									title: 'Failed to load scopes',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(loadError)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								direction: 'row',
								alignItems: 'center',
								gap: 's',
								children: ($$renderer) => {
									Button($$renderer, {
										compact: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Select all`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <span${$.attr_style('', { height: '20px' })}>`);
									Divider($$renderer, { vertical: true });
									$$renderer.push(`<!----></span> `);

									Button($$renderer, {
										compact: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Deselect all`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								gap: 'none',
								children: ($$renderer) => {
									Divider($$renderer, {});
									$$renderer.push(`<!----> <!--[-->`);

									const each_array = $.ensure_array_like(categories());

									for (let index = 0, $$length = each_array.length; index < $$length; index++) {
										let category = each_array[index];
										const checked = categoryState(category, scopes);
										const isLastItem = index === categories().length - 1;
										const scopesLength = filteredScopes().filter((n) => n.category === category && activeScopes[n.scope]).length;

										Accordion($$renderer, {
											selectable: true,
											title: category,
											hideDivider: isLastItem,
											badge: `${scopesLength} ${scopesLength === 1 ? 'Scope' : 'Scopes'}`,
											checked,
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_1 = $.ensure_array_like(filteredScopes().filter((s) => s.category === category));

															for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																let scope = each_array_1[$$index];

																if (Layout.Stack) {
																	$$renderer.push('<!--[-->');

																	Layout.Stack($$renderer, {
																		inline: true,
																		direction: 'row',
																		alignItems: 'flex-start',
																		gap: 's',
																		children: ($$renderer) => {
																			if (Selector.Checkbox) {
																				$$renderer.push('<!--[-->');

																				Selector.Checkbox($$renderer, {
																					size: 's',
																					id: scope.scope,
																					get checked() {
																						return activeScopes[scope.scope];
																					},

																					set checked($$value) {
																						activeScopes[scope.scope] = $$value;
																						$$settled = false;
																					}
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					gap: 'xxs',
																					children: ($$renderer) => {
																						$$renderer.push(`<label${$.attr('for', scope.scope)} class="svelte-1poxvtl">`);

																						if (Layout.Stack) {
																							$$renderer.push('<!--[-->');

																							Layout.Stack($$renderer, {
																								gap: 'xxs',
																								children: ($$renderer) => {
																									if (Layout.Stack) {
																										$$renderer.push('<!--[-->');

																										Layout.Stack($$renderer, {
																											inline: true,
																											direction: 'row',
																											alignItems: 'center',
																											gap: 'xxs',
																											children: ($$renderer) => {
																												if (Typography.Text) {
																													$$renderer.push('<!--[-->');

																													Typography.Text($$renderer, {
																														variant: 'm-500',
																														children: ($$renderer) => {
																															$$renderer.push(`<!---->${$.escape(scope.scope)}`);
																														},
																														$$slots: { default: true }
																													});

																													$$renderer.push('<!--]-->');
																												} else {
																													$$renderer.push('<!--[!-->');
																													$$renderer.push('<!--]-->');
																												}

																												$$renderer.push(` `);

																												if (scope.deprecated) {
																													$$renderer.push('<!--[0-->');
																													Badge($$renderer, { size: 'xs', variant: 'secondary', content: 'Deprecated' });
																												} else {
																													$$renderer.push('<!--[-1-->');
																												}

																												$$renderer.push(`<!--]-->`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (Typography.Text) {
																										$$renderer.push('<!--[-->');

																										Typography.Text($$renderer, {
																											variant: 'm-400',
																											color: '--fgcolor-neutral-tertiary',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->${$.escape(scope.description)}`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(`</label>`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { scopes });
	});
}