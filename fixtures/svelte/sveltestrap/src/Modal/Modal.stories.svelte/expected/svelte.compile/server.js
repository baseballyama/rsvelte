import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';

import {
	Button,
	ButtonGroup,
	Icon,
	ModalBody,
	ModalFooter,
	ModalHeader
} from '@sveltestrap/sveltestrap';

import Modal from './Modal.svelte';

export const meta = {
	title: 'Stories/Modal',
	component: Modal,
	parameters: {
		controls: { exclude: /^(close|closing|default|external|open|opening)$/g }
	},
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		static: { staticModal: 'string', table: { disable: true } },
		isOpen: { control: 'boolean' },
		autoFocus: { control: 'boolean' },
		body: { control: 'boolean' },
		centered: { control: 'boolean' },
		container: { control: 'text', table: { disable: true } },
		fullscreen: { control: 'boolean' },
		header: { control: 'text' },
		keyboard: { control: 'boolean' },
		scrollable: { control: 'boolean' },
		size: {
			control: { type: 'select' },
			options: ['sm', 'md', 'lg', 'xl']
		},
		toggle: { control: 'text', table: { disable: true } },
		labelledBy: { control: 'text', table: { disable: true } },
		backdrop: { control: 'boolean' },
		wrapClassName: { control: 'text', table: { disable: true } },
		modalClassName: { control: 'text', table: { disable: true } },
		contentClassName: { control: 'text', table: { disable: true } },
		fade: { control: 'boolean' },
		unmountOnClose: { control: 'boolean', table: { disable: true } },
		returnFocusAfterClose: { control: 'boolean', table: { disable: true } },
		modalStyle: { control: 'text', table: { disable: true } },
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
			}
		},
		'on:open': {
			control: false,
			description: 'This event is fired once the Modal has opened.',
			table: {
				category: 'events',
				type: { summary: 'Function' },
				defaultValue: { summary: 'null' }
			}
		},
		'on:opening': {
			control: false,
			description: 'This event is fired immediately once open has been triggered.',
			table: {
				category: 'events',
				type: { summary: 'Function' },
				defaultValue: { summary: 'null' }
			}
		},
		'on:close': {
			description: 'This event is fired once the Modal has closed.',
			table: {
				category: 'events',
				type: { summary: 'Function' },
				defaultValue: { summary: 'null' }
			}
		},
		'on:closing': {
			description: 'This event is fired immediately once close has been triggered.',
			table: {
				category: 'events',
				type: { summary: 'Function' },
				defaultValue: { summary: 'null' }
			}
		},
		'default ': {
			description: 'This is the default content slot.',
			table: {
				category: 'slots',
				type: { summary: 'any' },
				defaultValue: { summary: 'empty' }
			}
		},
		'external ': {
			description: 'This is for any content to include outside of the modal.',
			table: {
				category: 'slots',
				type: { summary: 'any' },
				defaultValue: { summary: 'empty' }
			}
		}
	},
	args: {
		autoFocus: true,
		backdrop: true,
		body: false,
		centered: false,
		container: undefined,
		fade: true,
		fullscreen: false,
		header: undefined,
		isOpen: false,
		keyboard: true,
		returnFocusAfterClose: true,
		scrollable: false,
		size: 'md',
		theme: null,
		toggle: undefined,
		unmountOnClose: true
	}
};

export default function Modal_stories($$renderer) {
	let open = false;
	let openScrollable = false;
	let status = 'Closed';
	let fullscreen;
	let size;

	const toggle = () => {
		size = undefined;
		open = !open;
	};

	const toggleLg = () => {
		size = 'lg';
		open = !open;
	};

	const toggleSm = () => {
		size = 'sm';
		open = !open;
	};

	const toggleXl = () => {
		size = 'xl';
		open = !open;
	};

	const toggleAlways = () => {
		fullscreen = true;
		open = !open;
	};

	const toggleScrollable = () => openScrollable = !openScrollable;

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<div>`);

				Button($$renderer, {
					color: 'danger',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open Modal`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Modal($$renderer, $.spread_props([
					args,
					{
						isOpen: open,
						toggle,
						modalStyle: `--bs-modal-color: ${args.theme === 'dark' ? '#fff' : '#111'}`,
						children: ($$renderer) => {
							ModalHeader($$renderer, {
								toggle,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Modal title`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ModalBody($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ModalFooter($$renderer, {
								children: ($$renderer) => {
									Button($$renderer, {
										color: 'primary',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Do Something`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Button($$renderer, {
										color: 'secondary',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Cancel`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push(`<!----></div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Basic' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Shorthand',
		children: ($$renderer) => {
			$$renderer.push(`<div>`);

			Button($$renderer, {
				color: 'danger',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open Modal`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				body: true,
				header: 'Modal title',
				isOpen: open,
				toggle,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Sizes',
		children: ($$renderer) => {
			$$renderer.push(`<div><div>`);

			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						color: 'success',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Open Small Modal`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						color: 'warning',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Open Default Modal`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						color: 'danger',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Open Large Modal`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						color: 'light',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Open Extra Large Modal`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				isOpen: open,
				toggle,
				size,
				children: ($$renderer) => {
					ModalHeader($$renderer, {
						toggle,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Modal title`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalBody($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalFooter($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Do Something`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color: 'secondary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Fullscreen',
		children: ($$renderer) => {
			$$renderer.push(`<div>`);

			Button($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open Fullscreen Modal`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				isOpen: open,
				toggle,
				fullscreen,
				children: ($$renderer) => {
					ModalHeader($$renderer, {
						toggle,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Modal title`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalBody($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalFooter($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Do Something`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color: 'secondary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Scrolling',
		children: ($$renderer) => {
			$$renderer.push(`<div>`);

			Button($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default scrolling`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'success',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Scrollable modal body`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				isOpen: open,
				toggle,
				children: ($$renderer) => {
					ModalHeader($$renderer, {
						toggle,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Modal title`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalBody($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<p style="min-height: 1000px;">This is some placeholder content to show the scrolling behavior for modals. Instead of repeating the text the
          modal, we use an inline style set a minimum height, thereby extending the length of the overall modal and
          demonstrating the overflow scrolling. When content becomes longer than the height of the viewport, scrolling
          will move the modal as needed.</p>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalFooter($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Do Something`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color: 'secondary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				isOpen: openScrollable,
				toggle: toggleScrollable,
				scrollable: true,
				children: ($$renderer) => {
					ModalHeader($$renderer, {
						toggle: toggleScrollable,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Modal title`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalBody($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<p style="min-height: 1000px;">This is some placeholder content to show the scrolling behavior for modals. Instead of repeating the text the
          modal, we use an inline style set a minimum height, thereby extending the length of the overall modal and
          demonstrating the overflow scrolling. When content becomes longer than the height of the viewport, scrolling
          will move the modal as needed.</p>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalFooter($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Do Something`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color: 'secondary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Backdrop',
		children: ($$renderer) => {
			$$renderer.push(`<div>`);

			Button($$renderer, {
				color: 'danger',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Modal with no Backdrop`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				isOpen: open,
				backdrop: false,
				toggle,
				children: ($$renderer) => {
					ModalHeader($$renderer, {
						toggle,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Modal title`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalBody($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalFooter($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Do Something`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color: 'secondary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'StaticBackdrop',
		children: ($$renderer) => {
			$$renderer.push(`<div>`);

			Button($$renderer, {
				color: 'danger',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Modal with Static Backdrop`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				isOpen: open,
				backdrop: 'static',
				toggle,
				children: ($$renderer) => {
					ModalHeader($$renderer, {
						toggle,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Modal title`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalBody($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Clicking outside modal or hitting Escape does not dismiss.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalFooter($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Do Something`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color: 'secondary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Fade',
		children: ($$renderer) => {
			$$renderer.push(`<div>`);

			Button($$renderer, {
				color: 'danger',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Modal with no Fade`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				isOpen: open,
				fade: false,
				toggle,
				children: ($$renderer) => {
					ModalHeader($$renderer, {
						toggle,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Modal title`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalBody($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalFooter($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								color: 'primary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Do Something`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								color: 'secondary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Events',
		children: ($$renderer) => {
			$$renderer.push(`<div class="modal-example"><h5 class="text-content">Current state: ${$.escape(status)}</h5> `);

			Button($$renderer, {
				color: 'danger',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open Modal`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				body: true,
				header: 'Modal title',
				isOpen: open,
				toggle,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Static',
		children: ($$renderer) => {
			$$renderer.push(`<div>`);

			Modal($$renderer, {
				static: true,
				isOpen: true,
				children: ($$renderer) => {
					ModalHeader($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Static Modal`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ModalBody($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'ExternalContent',
		children: ($$renderer) => {
			$$renderer.push(`<div>`);

			Button($$renderer, {
				color: 'danger',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open Modal`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				isOpen: open,
				toggle,
				body: true,
				children: ($$renderer) => {
					$$renderer.push(`<h4>You can add content outside the Modal.</h4> <p>Click the X on right to close.</p>`);
				},

				$$slots: {
					default: true,
					external: ($$renderer) => {
						$$renderer.push(`<div slot="external" class="text-end">`);

						Button($$renderer, {
							color: 'link',
							class: 'text-white',
							size: 'lg',
							children: ($$renderer) => {
								Icon($$renderer, { name: 'x', class: 'h1' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					}
				}
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}