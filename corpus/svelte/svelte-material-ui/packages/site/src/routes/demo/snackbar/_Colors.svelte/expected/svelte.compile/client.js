import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Snackbar, { Label, Actions } from '@smui/snackbar';
import IconButton, { Icon } from '@smui/icon-button';
import Button from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function _Colors($$anchor) {
	let snackbarSuccess;
	let snackbarWarning;
	let snackbarError;
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.bind_this(
		Snackbar(node, {
			class: 'demo-success',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				Label(node_1, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('That thing you tried to do actually worked, if you can believe it!');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Actions(node_2, {
					children: ($$anchor, $$slotProps) => {
						IconButton($$anchor, {
							title: 'Dismiss',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('close');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}),
		($$value) => snackbarSuccess = $$value,
		() => snackbarSuccess
	);

	var node_3 = $.sibling(node, 2);

	$.bind_this(
		Snackbar(node_3, {
			class: 'demo-warning',
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_4 = $.first_child(fragment_4);

				Label(node_4, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Ok, it looks like that thing you tried to do might not have work.');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				Actions(node_5, {
					children: ($$anchor, $$slotProps) => {
						IconButton($$anchor, {
							title: 'Dismiss',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('close');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		}),
		($$value) => snackbarWarning = $$value,
		() => snackbarWarning
	);

	var node_6 = $.sibling(node_3, 2);

	$.bind_this(
		Snackbar(node_6, {
			class: 'demo-error',
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root();
				var node_7 = $.first_child(fragment_7);

				Label(node_7, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('That thing you tried to do didn\'t work. Honestly, I\'m not sure why you even\n    tried.');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				Actions(node_8, {
					children: ($$anchor, $$slotProps) => {
						IconButton($$anchor, {
							title: 'Dismiss',
							children: ($$anchor, $$slotProps) => {
								Icon($$anchor, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('close');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		}),
		($$value) => snackbarError = $$value,
		() => snackbarError
	);

	var node_9 = $.sibling(node_6, 2);

	Button(node_9, {
		onclick: () => snackbarSuccess.open(),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Open Success Snackbar');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Button(node_10, {
		onclick: () => snackbarWarning.open(),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Open Warning Snackbar');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Button(node_11, {
		onclick: () => snackbarError.open(),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Open Error Snackbar');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}