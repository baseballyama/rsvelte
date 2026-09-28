import * as $ from 'svelte/internal/server';
import * as AlertDialog from '$lib/components/ui/alert-dialog';
import { Input } from '$lib/components/ui/input';

class ConfirmDeleteDialogState {
	open = false;
	inputText = '';
	options = null;
	loading = false;

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

export default function Confirm_delete_dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (AlertDialog.Root) {
				$$renderer.push('<!--[-->');

				AlertDialog.Root($$renderer, {
					get open() {
						return dialogState.open;
					},

					set open($$value) {
						dialogState.open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (AlertDialog.Content) {
							$$renderer.push('<!--[-->');

							AlertDialog.Content($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<form method="POST" class="flex flex-col gap-4">`);

									if (AlertDialog.Header) {
										$$renderer.push('<!--[-->');

										AlertDialog.Header($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Title) {
													$$renderer.push('<!--[-->');

													AlertDialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(dialogState.options?.title)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Description) {
													$$renderer.push('<!--[-->');

													AlertDialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(dialogState.options?.description)}`);
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

									$$renderer.push(` `);

									if (dialogState.options?.input) {
										$$renderer.push('<!--[0-->');

										Input($$renderer, {
											placeholder: `Enter \"${dialogState.options.input.confirmationText}\" to confirm.`,
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
												$$settled = false;
											}
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (AlertDialog.Footer) {
										$$renderer.push('<!--[-->');

										AlertDialog.Footer($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Cancel) {
													$$renderer.push('<!--[-->');

													AlertDialog.Cancel($$renderer, {
														type: 'button',
														onclick: dialogState.cancel,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(dialogState.options?.cancel?.text ?? 'Cancel')}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Action) {
													$$renderer.push('<!--[-->');

													AlertDialog.Action($$renderer, {
														type: 'submit',
														variant: 'destructive',
														loading: dialogState.loading,
														disabled: dialogState.options?.input && dialogState.inputText !== dialogState.options.input.confirmationText,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(dialogState.options?.confirm?.text ?? 'Delete')}`);
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

									$$renderer.push(`</form>`);
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
	});
}