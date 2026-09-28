import * as $ from 'svelte/internal/server';
import { tick } from 'svelte';
import { prefixFilter } from '@smui/common/internal';
import { Label } from '@smui/common';
import Button from '@smui/button';
import IconButton, { Icon } from '@smui/icon-button';
import Snackbar from '../Snackbar.svelte';
import Actions from '../Actions.svelte';

export default function Kitchen($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { dismiss, $$slots, $$events, ...restProps

		/**
		 * If provided, the button will act as a link.
		 */
		/**
		 * The tag name of the element to create.
		 */
		/**
		 * A spot for the dismiss icon contents.
		 */
		 } = $$props;

		let element = void 0;
		let snackbars = [];
		let config = void 0;
		let waiting = false;

		// Let the snackbar render its elements.
		function handleClosed(e) {
			if (config?.onClose) {
				config.onClose(e);
			}

			snackbars.splice(0, 1);

			// Let the snackbar handle its close event.
			tick().then(() => {
				config = undefined;
			});
		}

		function handleActionClick(action, e) {
			if (action.onClick) {
				action.onClick(e);
			}
		}

		function handleDismiss(e) {
			if (config?.onDismiss) {
				config.onDismiss(e);
			}
		}

		function push(config) {
			snackbars.push(config);
		}

		function getElement() {
			return element?.getElement();
		}

		if (config) {
			$$renderer.push('<!--[0-->');

			Snackbar($$renderer, $.spread_props([
				{ labelText: config.label },
				config && config.props || {},
				prefixFilter(restProps, 'snackbar$'),
				{
					onSMUISnackbarClosed: (e) => {
						handleClosed(e);
						restProps.snackbar$onSMUISnackbarClosed?.(e);
					},

					children: ($$renderer) => {
						Label($$renderer, $.spread_props([prefixFilter(restProps, 'label$')]));
						$$renderer.push(`<!----> `);

						if (config.actions || config.dismissButton) {
							$$renderer.push('<!--[0-->');

							Actions($$renderer, {
								children: ($$renderer) => {
									if (config.actions) {
										$$renderer.push(`<!--[0--><!--[-->`);

										const each_array = $.ensure_array_like(config.actions);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let action = each_array[$$index];

											Button($$renderer, $.spread_props([
												prefixFilter(restProps, 'action$'),
												{
													onclick: (e) => {
														handleActionClick(action, e);
														restProps.action$onclick?.(e);
													},

													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(action.text)}`);
													},
													$$slots: { default: true }
												}
											]));
										}

										$$renderer.push(`<!--]-->`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (config.dismissButton) {
										$$renderer.push('<!--[0-->');

										IconButton($$renderer, $.spread_props([
											{ title: config.dismissTitle || 'Dismiss' },
											prefixFilter(restProps, 'dismiss$'),
											{
												onclick: (e) => {
													handleDismiss(e);
													restProps.dismiss$onclick?.(e);
												},

												children: ($$renderer) => {
													Icon($$renderer, $.spread_props([
														prefixFilter(restProps, 'dismissIcon$'),
														{
															children: ($$renderer) => {
																if (dismiss) {
																	$$renderer.push('<!--[0-->');
																	dismiss?.($$renderer);
																	$$renderer.push(`<!---->`);
																} else {
																	$$renderer.push(`<!--[-1-->${$.escape(config.dismissText ?? 'close')}`);
																}

																$$renderer.push(`<!--]-->`);
															},
															$$slots: { default: true }
														}
													]));
												},
												$$slots: { default: true }
											}
										]));
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				}
			]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { push, getElement });
	});
}