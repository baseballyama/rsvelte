import 'svelte/internal/disclose-version';
import Modal from './Modal.svelte';
import * as $ from 'svelte/internal/client';
import { Story, Template } from '@storybook/addon-svelte-csf';

import {
	Button,
	ButtonGroup,
	Icon,
	ModalBody,
	ModalFooter,
	ModalHeader
} from '@sveltestrap/sveltestrap';

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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div><!> <!></div>`);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<div><div><!> <!></div></div>`);

var root_5 = $.from_html(`<p style="min-height: 1000px;">This is some placeholder content to show the scrolling behavior for modals. Instead of repeating the text the
          modal, we use an inline style set a minimum height, thereby extending the length of the overall modal and
          demonstrating the overflow scrolling. When content becomes longer than the height of the viewport, scrolling
          will move the modal as needed.</p>`);

var root_6 = $.from_html(`<div><!> <!> <!> <!></div>`);
var root_7 = $.from_html(`<div class="modal-example"><h5 class="text-content"> </h5> <!> <!></div>`);
var root_8 = $.from_html(`<div><!></div>`);
var root_9 = $.from_html(`<h4>You can add content outside the Modal.</h4> <p>Click the X on right to close.</p>`, 1);
var root_10 = $.from_html(`<div slot="external" class="text-end"><!></div>`);
var root_11 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Modal_stories($$anchor) {
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
	var fragment = root_11();
	var node = $.first_child(fragment);

	Template(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var div = root_2();
				var node_1 = $.child(div);

				Button(node_1, {
					color: 'danger',
					$$events: { click: toggle },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Open Modal');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => $.get(args).theme === 'dark' ? '#fff' : '#111');

					Modal(node_2, $.spread_props(() => $.get(args), {
						get isOpen() {
							return open;
						},
						toggle,
						get modalStyle() {
							return `--bs-modal-color: ${$.get($0) ?? ''}`;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_3 = $.first_child(fragment_1);

							ModalHeader(node_3, {
								toggle,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Modal title');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							ModalBody(node_4, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore\n        magna aliqua.');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							ModalFooter(node_5, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var node_6 = $.first_child(fragment_2);

									Button(node_6, {
										color: 'primary',
										$$events: { click: toggle },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Do Something');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									var node_7 = $.sibling(node_6, 2);

									Button(node_7, {
										color: 'secondary',
										$$events: { click: toggle },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Cancel');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					}));
				}

				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_8 = $.sibling(node, 2);

	Story(node_8, { name: 'Basic' });

	var node_9 = $.sibling(node_8, 2);

	Story(node_9, {
		name: 'Shorthand',
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_2();
			var node_10 = $.child(div_1);

			Button(node_10, {
				color: 'danger',
				$$events: { click: toggle },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Open Modal');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Modal(node_11, {
				body: true,
				header: 'Modal title',
				get isOpen() {
					return open;
				},
				toggle,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore\n      magna aliqua.');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_9, 2);

	Story(node_12, {
		name: 'Sizes',
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_4();
			var div_3 = $.child(div_2);
			var node_13 = $.child(div_3);

			ButtonGroup(node_13, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_3();
					var node_14 = $.first_child(fragment_3);

					Button(node_14, {
						color: 'success',
						$$events: { click: toggleSm },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Open Small Modal');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					Button(node_15, {
						color: 'warning',
						$$events: { click: toggle },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Open Default Modal');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					Button(node_16, {
						color: 'danger',
						$$events: { click: toggleLg },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Open Large Modal');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					Button(node_17, {
						color: 'light',
						$$events: { click: toggleXl },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Open Extra Large Modal');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_13, 2);

			Modal(node_18, {
				get isOpen() {
					return open;
				},
				toggle,
				get size() {
					return size;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_19 = $.first_child(fragment_4);

					ModalHeader(node_19, {
						toggle,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('Modal title');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});

					var node_20 = $.sibling(node_19, 2);

					ModalBody(node_20, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore\n          magna aliqua.');

							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});

					var node_21 = $.sibling(node_20, 2);

					ModalFooter(node_21, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_22 = $.first_child(fragment_5);

							Button(node_22, {
								color: 'primary',
								$$events: { click: toggle },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_13 = $.text('Do Something');

									$.append($$anchor, text_13);
								},
								$$slots: { default: true }
							});

							var node_23 = $.sibling(node_22, 2);

							Button(node_23, {
								color: 'secondary',
								$$events: { click: toggle },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_14 = $.text('Cancel');

									$.append($$anchor, text_14);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node_12, 2);

	Story(node_24, {
		name: 'Fullscreen',
		children: ($$anchor, $$slotProps) => {
			var div_4 = root_2();
			var node_25 = $.child(div_4);

			Button(node_25, {
				color: 'primary',
				$$events: { click: toggleAlways },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('Open Fullscreen Modal');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			var node_26 = $.sibling(node_25, 2);

			Modal(node_26, {
				get isOpen() {
					return open;
				},
				toggle,
				get fullscreen() {
					return fullscreen;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_1();
					var node_27 = $.first_child(fragment_6);

					ModalHeader(node_27, {
						toggle,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_16 = $.text('Modal title');

							$.append($$anchor, text_16);
						},
						$$slots: { default: true }
					});

					var node_28 = $.sibling(node_27, 2);

					ModalBody(node_28, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_17 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore\n        magna aliqua.');

							$.append($$anchor, text_17);
						},
						$$slots: { default: true }
					});

					var node_29 = $.sibling(node_28, 2);

					ModalFooter(node_29, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_30 = $.first_child(fragment_7);

							Button(node_30, {
								color: 'primary',
								$$events: { click: toggle },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_18 = $.text('Do Something');

									$.append($$anchor, text_18);
								},
								$$slots: { default: true }
							});

							var node_31 = $.sibling(node_30, 2);

							Button(node_31, {
								color: 'secondary',
								$$events: { click: toggle },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_19 = $.text('Cancel');

									$.append($$anchor, text_19);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_32 = $.sibling(node_24, 2);

	Story(node_32, {
		name: 'Scrolling',
		children: ($$anchor, $$slotProps) => {
			var div_5 = root_6();
			var node_33 = $.child(div_5);

			Button(node_33, {
				color: 'primary',
				$$events: { click: toggle },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_20 = $.text('Default scrolling');

					$.append($$anchor, text_20);
				},
				$$slots: { default: true }
			});

			var node_34 = $.sibling(node_33, 2);

			Button(node_34, {
				color: 'success',
				$$events: { click: toggleScrollable },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_21 = $.text('Scrollable modal body');

					$.append($$anchor, text_21);
				},
				$$slots: { default: true }
			});

			var node_35 = $.sibling(node_34, 2);

			Modal(node_35, {
				get isOpen() {
					return open;
				},
				toggle,
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root_1();
					var node_36 = $.first_child(fragment_8);

					ModalHeader(node_36, {
						toggle,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_22 = $.text('Modal title');

							$.append($$anchor, text_22);
						},
						$$slots: { default: true }
					});

					var node_37 = $.sibling(node_36, 2);

					ModalBody(node_37, {
						children: ($$anchor, $$slotProps) => {
							var p = root_5();

							$.append($$anchor, p);
						},
						$$slots: { default: true }
					});

					var node_38 = $.sibling(node_37, 2);

					ModalFooter(node_38, {
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root();
							var node_39 = $.first_child(fragment_9);

							Button(node_39, {
								color: 'primary',
								$$events: { click: toggle },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_23 = $.text('Do Something');

									$.append($$anchor, text_23);
								},
								$$slots: { default: true }
							});

							var node_40 = $.sibling(node_39, 2);

							Button(node_40, {
								color: 'secondary',
								$$events: { click: toggle },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_24 = $.text('Cancel');

									$.append($$anchor, text_24);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			var node_41 = $.sibling(node_35, 2);

			Modal(node_41, {
				get isOpen() {
					return openScrollable;
				},
				toggle: toggleScrollable,
				scrollable: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root_1();
					var node_42 = $.first_child(fragment_10);

					ModalHeader(node_42, {
						toggle: toggleScrollable,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_25 = $.text('Modal title');

							$.append($$anchor, text_25);
						},
						$$slots: { default: true }
					});

					var node_43 = $.sibling(node_42, 2);

					ModalBody(node_43, {
						children: ($$anchor, $$slotProps) => {
							var p_1 = root_5();

							$.append($$anchor, p_1);
						},
						$$slots: { default: true }
					});

					var node_44 = $.sibling(node_43, 2);

					ModalFooter(node_44, {
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root();
							var node_45 = $.first_child(fragment_11);

							Button(node_45, {
								color: 'primary',
								$$events: { click: toggleScrollable },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_26 = $.text('Do Something');

									$.append($$anchor, text_26);
								},
								$$slots: { default: true }
							});

							var node_46 = $.sibling(node_45, 2);

							Button(node_46, {
								color: 'secondary',
								$$events: { click: toggleScrollable },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_27 = $.text('Cancel');

									$.append($$anchor, text_27);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	var node_47 = $.sibling(node_32, 2);

	Story(node_47, {
		name: 'Backdrop',
		children: ($$anchor, $$slotProps) => {
			var div_6 = root_2();
			var node_48 = $.child(div_6);

			Button(node_48, {
				color: 'danger',
				$$events: { click: toggle },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_28 = $.text('Modal with no Backdrop');

					$.append($$anchor, text_28);
				},
				$$slots: { default: true }
			});

			var node_49 = $.sibling(node_48, 2);

			Modal(node_49, {
				get isOpen() {
					return open;
				},
				backdrop: false,
				toggle,
				children: ($$anchor, $$slotProps) => {
					var fragment_12 = root_1();
					var node_50 = $.first_child(fragment_12);

					ModalHeader(node_50, {
						toggle,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_29 = $.text('Modal title');

							$.append($$anchor, text_29);
						},
						$$slots: { default: true }
					});

					var node_51 = $.sibling(node_50, 2);

					ModalBody(node_51, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_30 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore\n        magna aliqua.');

							$.append($$anchor, text_30);
						},
						$$slots: { default: true }
					});

					var node_52 = $.sibling(node_51, 2);

					ModalFooter(node_52, {
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root();
							var node_53 = $.first_child(fragment_13);

							Button(node_53, {
								color: 'primary',
								$$events: { click: toggle },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_31 = $.text('Do Something');

									$.append($$anchor, text_31);
								},
								$$slots: { default: true }
							});

							var node_54 = $.sibling(node_53, 2);

							Button(node_54, {
								color: 'secondary',
								$$events: { click: toggle },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_32 = $.text('Cancel');

									$.append($$anchor, text_32);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_12);
				},
				$$slots: { default: true }
			});

			$.reset(div_6);
			$.append($$anchor, div_6);
		},
		$$slots: { default: true }
	});

	var node_55 = $.sibling(node_47, 2);

	Story(node_55, {
		name: 'StaticBackdrop',
		children: ($$anchor, $$slotProps) => {
			var div_7 = root_2();
			var node_56 = $.child(div_7);

			Button(node_56, {
				color: 'danger',
				$$events: { click: toggle },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_33 = $.text('Modal with Static Backdrop');

					$.append($$anchor, text_33);
				},
				$$slots: { default: true }
			});

			var node_57 = $.sibling(node_56, 2);

			Modal(node_57, {
				get isOpen() {
					return open;
				},
				backdrop: 'static',
				toggle,
				children: ($$anchor, $$slotProps) => {
					var fragment_14 = root_1();
					var node_58 = $.first_child(fragment_14);

					ModalHeader(node_58, {
						toggle,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_34 = $.text('Modal title');

							$.append($$anchor, text_34);
						},
						$$slots: { default: true }
					});

					var node_59 = $.sibling(node_58, 2);

					ModalBody(node_59, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_35 = $.text('Clicking outside modal or hitting Escape does not dismiss.');

							$.append($$anchor, text_35);
						},
						$$slots: { default: true }
					});

					var node_60 = $.sibling(node_59, 2);

					ModalFooter(node_60, {
						children: ($$anchor, $$slotProps) => {
							var fragment_15 = root();
							var node_61 = $.first_child(fragment_15);

							Button(node_61, {
								color: 'primary',
								$$events: { click: toggle },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_36 = $.text('Do Something');

									$.append($$anchor, text_36);
								},
								$$slots: { default: true }
							});

							var node_62 = $.sibling(node_61, 2);

							Button(node_62, {
								color: 'secondary',
								$$events: { click: toggle },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_37 = $.text('Cancel');

									$.append($$anchor, text_37);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_15);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_14);
				},
				$$slots: { default: true }
			});

			$.reset(div_7);
			$.append($$anchor, div_7);
		},
		$$slots: { default: true }
	});

	var node_63 = $.sibling(node_55, 2);

	Story(node_63, {
		name: 'Fade',
		children: ($$anchor, $$slotProps) => {
			var div_8 = root_2();
			var node_64 = $.child(div_8);

			Button(node_64, {
				color: 'danger',
				$$events: { click: toggle },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_38 = $.text('Modal with no Fade');

					$.append($$anchor, text_38);
				},
				$$slots: { default: true }
			});

			var node_65 = $.sibling(node_64, 2);

			Modal(node_65, {
				get isOpen() {
					return open;
				},
				fade: false,
				toggle,
				children: ($$anchor, $$slotProps) => {
					var fragment_16 = root_1();
					var node_66 = $.first_child(fragment_16);

					ModalHeader(node_66, {
						toggle,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_39 = $.text('Modal title');

							$.append($$anchor, text_39);
						},
						$$slots: { default: true }
					});

					var node_67 = $.sibling(node_66, 2);

					ModalBody(node_67, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_40 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore\n        magna aliqua.');

							$.append($$anchor, text_40);
						},
						$$slots: { default: true }
					});

					var node_68 = $.sibling(node_67, 2);

					ModalFooter(node_68, {
						children: ($$anchor, $$slotProps) => {
							var fragment_17 = root();
							var node_69 = $.first_child(fragment_17);

							Button(node_69, {
								color: 'primary',
								$$events: { click: toggle },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_41 = $.text('Do Something');

									$.append($$anchor, text_41);
								},
								$$slots: { default: true }
							});

							var node_70 = $.sibling(node_69, 2);

							Button(node_70, {
								color: 'secondary',
								$$events: { click: toggle },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_42 = $.text('Cancel');

									$.append($$anchor, text_42);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_17);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_16);
				},
				$$slots: { default: true }
			});

			$.reset(div_8);
			$.append($$anchor, div_8);
		},
		$$slots: { default: true }
	});

	var node_71 = $.sibling(node_63, 2);

	Story(node_71, {
		name: 'Events',
		children: ($$anchor, $$slotProps) => {
			var div_9 = root_7();
			var h5 = $.child(div_9);
			var text_43 = $.only_child(h5);
			var node_72 = $.sibling(h5, 2);

			Button(node_72, {
				color: 'danger',
				$$events: { click: toggle },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_44 = $.text('Open Modal');

					$.append($$anchor, text_44);
				},
				$$slots: { default: true }
			});

			var node_73 = $.sibling(node_72, 2);

			Modal(node_73, {
				body: true,
				header: 'Modal title',
				get isOpen() {
					return open;
				},
				toggle,
				$$events: {
					opening: () => status = 'Opening...',
					open: () => status = 'Opened',
					closing: () => status = 'Closing...',
					close: () => status = 'Closed'
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_45 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore\n      magna aliqua.');

					$.append($$anchor, text_45);
				},
				$$slots: { default: true }
			});

			$.reset(div_9);
			$.template_effect(() => $.set_text(text_43, `Current state: ${status ?? ''}`));
			$.append($$anchor, div_9);
		},
		$$slots: { default: true }
	});

	var node_74 = $.sibling(node_71, 2);

	Story(node_74, {
		name: 'Static',
		children: ($$anchor, $$slotProps) => {
			var div_10 = root_8();
			var node_75 = $.child(div_10);

			Modal(node_75, {
				static: true,
				isOpen: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_18 = root();
					var node_76 = $.first_child(fragment_18);

					ModalHeader(node_76, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_46 = $.text('Static Modal');

							$.append($$anchor, text_46);
						},
						$$slots: { default: true }
					});

					var node_77 = $.sibling(node_76, 2);

					ModalBody(node_77, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_47 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore\n        magna aliqua.');

							$.append($$anchor, text_47);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_18);
				},
				$$slots: { default: true }
			});

			$.reset(div_10);
			$.append($$anchor, div_10);
		},
		$$slots: { default: true }
	});

	var node_78 = $.sibling(node_74, 2);

	Story(node_78, {
		name: 'ExternalContent',
		children: ($$anchor, $$slotProps) => {
			var div_11 = root_2();
			var node_79 = $.child(div_11);

			Button(node_79, {
				color: 'danger',
				$$events: { click: toggle },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_48 = $.text('Open Modal');

					$.append($$anchor, text_48);
				},
				$$slots: { default: true }
			});

			var node_80 = $.sibling(node_79, 2);

			Modal(node_80, {
				get isOpen() {
					return open;
				},
				toggle,
				body: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_19 = root_9();

					$.next(2);
					$.append($$anchor, fragment_19);
				},

				$$slots: {
					default: true,
					external: ($$anchor, $$slotProps) => {
						var div_12 = root_10();
						var node_81 = $.child(div_12);

						Button(node_81, {
							color: 'link',
							class: 'text-white',
							size: 'lg',
							$$events: { click: toggle },
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, { name: 'x', class: 'h1' });
							},
							$$slots: { default: true }
						});

						$.reset(div_12);
						$.append($$anchor, div_12);
					}
				}
			});

			$.reset(div_11);
			$.append($$anchor, div_11);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}