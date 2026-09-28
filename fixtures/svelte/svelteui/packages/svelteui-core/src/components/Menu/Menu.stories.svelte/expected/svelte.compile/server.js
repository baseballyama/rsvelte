import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Menu } from './index';
import { Button } from '../Button';
import { Kbd } from '../Kbd';
import { Divider } from '../Divider';
import { Center } from '../Center';
import { SimpleGrid } from '../SimpleGrid';
import { TextInput } from '../TextInput';
import { Camera, ChatBubble, Gear, MagnifyingGlass, Trash, Width } from 'radix-icons-svelte';

export default function Menu_stories($$renderer) {
	let menuEvents = [];
	let element;

	Meta($$renderer, { title: 'Components/Menu', component: Menu });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Menu($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							if (Menu.Item) {
								$$renderer.push('<!--[-->');

								Menu.Item($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Basic Menu`);
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
					}
				]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Menu', id: 'menuStory' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'With Content',
		id: 'menuContentStory',
		children: ($$renderer) => {
			Menu($$renderer, {
				children: ($$renderer) => {
					if (Menu.Label) {
						$$renderer.push('<!--[-->');

						Menu.Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Application`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: Gear,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Settings`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: ChatBubble,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Messages`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: Camera,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Gallery`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: MagnifyingGlass,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Search`);
							},

							$$slots: {
								default: true,
								rightSection: ($$renderer) => {
									Kbd($$renderer, {
										slot: 'rightSection',
										children: ($$renderer) => {
											$$renderer.push(`<!---->⌘K`);
										},
										$$slots: { default: true }
									});
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Divider($$renderer, {});
					$$renderer.push(`<!----> `);

					if (Menu.Label) {
						$$renderer.push('<!--[-->');

						Menu.Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Danger zone`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: Width,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Transfer my data`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							color: 'red',
							icon: Trash,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Delete my account`);
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
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Custom Control',
		id: 'menuCustomControlStory',
		children: ($$renderer) => {
			Menu($$renderer, {
				children: ($$renderer) => {
					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: Gear,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Settings`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: ChatBubble,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Messages`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: Camera,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Gallery`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},

				$$slots: {
					default: true,
					control: ($$renderer) => {
						Button($$renderer, {
							slot: 'control',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Toggle Menu`);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Custom placement',
		id: 'menuCustomPlacementStory',
		children: ($$renderer) => {
			SimpleGrid($$renderer, {
				cols: 3,
				spacing: 100,
				children: ($$renderer) => {
					Center($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Start: `);

							Menu($$renderer, {
								placement: 'start',
								opened: true,
								children: ($$renderer) => {
									if (Menu.Item) {
										$$renderer.push('<!--[-->');

										Menu.Item($$renderer, {
											icon: Gear,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Settings`);
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

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Center($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Center: `);

							Menu($$renderer, {
								placement: 'center',
								opened: true,
								children: ($$renderer) => {
									if (Menu.Item) {
										$$renderer.push('<!--[-->');

										Menu.Item($$renderer, {
											icon: Gear,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Settings`);
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

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Center($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->End: `);

							Menu($$renderer, {
								placement: 'end',
								opened: true,
								children: ($$renderer) => {
									if (Menu.Item) {
										$$renderer.push('<!--[-->');

										Menu.Item($$renderer, {
											icon: Gear,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Settings`);
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

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Center($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Start: `);

							Menu($$renderer, {
								placement: 'start',
								opened: true,
								children: ($$renderer) => {
									if (Menu.Item) {
										$$renderer.push('<!--[-->');

										Menu.Item($$renderer, {
											icon: Gear,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Settings`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},

								$$slots: {
									default: true,
									control: ($$renderer) => {
										Button($$renderer, {
											slot: 'control',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Custom control`);
											},
											$$slots: { default: true }
										});
									}
								}
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Center($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Center: `);

							Menu($$renderer, {
								placement: 'center',
								opened: true,
								children: ($$renderer) => {
									if (Menu.Item) {
										$$renderer.push('<!--[-->');

										Menu.Item($$renderer, {
											icon: Gear,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Settings`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},

								$$slots: {
									default: true,
									control: ($$renderer) => {
										Button($$renderer, {
											slot: 'control',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Custom control`);
											},
											$$slots: { default: true }
										});
									}
								}
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Center($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->End: `);

							Menu($$renderer, {
								placement: 'end',
								opened: true,
								children: ($$renderer) => {
									if (Menu.Item) {
										$$renderer.push('<!--[-->');

										Menu.Item($$renderer, {
											icon: Gear,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Settings`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},

								$$slots: {
									default: true,
									control: ($$renderer) => {
										Button($$renderer, {
											slot: 'control',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Custom control`);
											},
											$$slots: { default: true }
										});
									}
								}
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Event listeners',
		id: 'menuEventListenersStory',
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Test event`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Menu($$renderer, {
				children: ($$renderer) => {
					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: Gear,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Settings`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},

				$$slots: {
					default: true,
					control: ($$renderer) => {
						Button($$renderer, {
							slot: 'control',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Toggle menu`);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			$$renderer.push(`<!----> <ol><!--[-->`);

			const each_array = $.ensure_array_like(menuEvents);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let event = each_array[$$index];

				$$renderer.push(`<li>${$.escape(event)}</li>`);
			}

			$$renderer.push(`<!--]--></ol>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Menu with Input',
		id: 'menuWithInputStory',
		children: ($$renderer) => {
			Menu($$renderer, {
				children: ($$renderer) => {
					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: Gear,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Settings`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: ChatBubble,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Messages`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: Camera,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Gallery`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Menu.Label) {
						$$renderer.push('<!--[-->');

						Menu.Label($$renderer, {
							children: ($$renderer) => {
								TextInput($$renderer, { placeholder: 'Search' });
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},

				$$slots: {
					default: true,
					control: ($$renderer) => {
						Button($$renderer, {
							slot: 'control',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Toggle Menu`);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Outside Toggle',
		id: 'menuOutsideToggleStory',
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Toggle Menu`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Menu($$renderer, {
				children: ($$renderer) => {
					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: Gear,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Settings`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: ChatBubble,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Messages`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: Camera,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Gallery`);
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Close on Item Click (false)',
		id: 'menuCloseOnItemClickStory',
		children: ($$renderer) => {
			Menu($$renderer, {
				closeOnItemClick: false,
				children: ($$renderer) => {
					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: Gear,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Settings`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: ChatBubble,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Messages`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Menu.Item) {
						$$renderer.push('<!--[-->');

						Menu.Item($$renderer, {
							icon: Camera,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Gallery`);
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
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}