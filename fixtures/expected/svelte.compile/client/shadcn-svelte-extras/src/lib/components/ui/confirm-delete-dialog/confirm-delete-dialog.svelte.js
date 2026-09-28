import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as AlertDialog from '$lib/components/ui/alert-dialog';
import { Input } from '$lib/components/ui/input';

class ConfirmDeleteDialogState {
	#open = $.state(false);

	get open() {
		return $.get(this.#open);
	}

	set open(value) {
		$.set(this.#open, value, true);
	}

	#inputText = $.state('');

	get inputText() {
		return $.get(this.#inputText);
	}

	set inputText(value) {
		$.set(this.#inputText, value, true);
	}

	#options = $.state(null);

	get options() {
		return $.get(this.#options);
	}

	set options(value) {
		$.set(this.#options, value, true);
	}

	#loading = $.state(false);

	get loading() {
		return $.get(this.#loading);
	}

	set loading(value) {
		$.set(this.#loading, value, true);
	}

	constructor() {
		this.confirm = this.confirm.bind(this);
		this.cancel = this.cancel.bind(this);
	}

	newConfirmation(options) {
		this.reset();
		this.options = options;
		this.open = true;
	}

	reset() {
		this.open = false;
		this.inputText = '';
		this.options = null;
	}

	confirm() {
		if (this.options?.input) {
			if (this.inputText !== this.options.input.confirmationText) {
				return;
			}
		}

		this.loading = true;

		this.options?.onConfirm().then(() => {
			this.open = false;
		}).finally(() => {
			this.loading = false;
		});
	}

	cancel() {
		this.options?.onCancel?.();
		this.open = false;
	}
}

const dialogState = new ConfirmDeleteDialogState();

export function confirmDelete(options) {
	if (options.skipConfirmation) {
		options.onConfirm();

		return;
	}

	dialogState.newConfirmation(options);
}

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<form method="POST" class="flex flex-col gap-4"><!> <!> <!></form>`);

export default function Confirm_delete_dialog($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			get open() {
				return dialogState.open;
			},

			set open($$value) {
				dialogState.open = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
					AlertDialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var form = root_1();
							var node_2 = $.child(form);

							$.component(node_2, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
								AlertDialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, dialogState.options?.title));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, dialogState.options?.description));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_2, 2);

							{
								var consequent = ($$anchor) => {
									{
										let $0 = $.derived(() => `Enter \"${dialogState.options.input.confirmationText}\" to confirm.`);

										Input($$anchor, {
											get placeholder() {
												return $.get($0);
											},

											onkeydown: (e) => {
												if (e.key === 'Enter') {
													// for some reason without this the form will submit and the dialog will close immediately
													e.preventDefault();

													dialogState.confirm();
												}
											},

											get value() {
												return dialogState.inputText;
											},

											set value($$value) {
												dialogState.inputText = $$value;
											}
										});
									}
								};

								$.if(node_5, ($$render) => {
									if (dialogState.options?.input) $$render(consequent);
								});
							}

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
								AlertDialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_7 = $.first_child(fragment_6);

										$.component(node_7, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
											AlertDialog_Cancel($$anchor, {
												type: 'button',
												get onclick() {
													return dialogState.cancel;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text();

													$.template_effect(() => $.set_text(text_2, dialogState.options?.cancel?.text ?? 'Cancel'));
													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_8 = $.sibling(node_7, 2);

										{
											let $0 = $.derived(() => dialogState.options?.input && dialogState.inputText !== dialogState.options.input.confirmationText);

											$.component(node_8, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
												AlertDialog_Action($$anchor, {
													type: 'submit',
													variant: 'destructive',
													get loading() {
														return dialogState.loading;
													},

													get disabled() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text();

														$.template_effect(() => $.set_text(text_3, dialogState.options?.confirm?.text ?? 'Delete'));
														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.reset(form);

							$.event('submit', form, (e) => {
								e.preventDefault();
								dialogState.confirm();
							});

							$.append($$anchor, form);
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