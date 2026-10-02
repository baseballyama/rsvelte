import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isHttpError } from '@sveltejs/kit';

import {
	validated_query_no_args,
	validated_query_with_arg,
	validated_live_query_no_args,
	validated_live_query_with_arg,
	validated_prerendered_query_no_args,
	validated_prerendered_query_with_arg,
	validated_command_no_args,
	validated_command_with_arg,
	validated_batch_query_no_validation,
	validated_batch_query_with_validation
} from './validation.remote.js';

var root = $.from_html(`<p> </p> <button>valid</button> <button>invalid (arg when no args expected)</button> <button>invalid (wrong arg type)</button> <button>ignored (more than one arg, only one sent to backend)</button>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	function validate_result(result) {
		if (result !== 'success') {
			throw new Error('Remote function called with invalid arguments');
		}
	}

	async function read_live(resource) {
		for await (const value of resource) {
			return value;
		}

		throw new Error('query.live did not yield a value');
	}

	let status = $.state('pending');
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var button = $.sibling(p, 2);
	var button_1 = $.sibling(button, 2);

	var // @ts-expect-error
	// @ts-expect-error
	// @ts-expect-error
	// @ts-expect-error
	button_2 = $.sibling(button_1, 2);

	var // @ts-expect-error
	// @ts-expect-error
	// @ts-expect-error
	// @ts-expect-error
	// @ts-expect-error
	button_3 = $.sibling(button_2, 2);

	$.template_effect(() => $.set_text(text, $.get(status)));

	$.delegated('click', button, async () => {
		$.set(status, 'pending');

		try {
			validate_result(await validated_query_no_args());
			validate_result(await read_live(validated_live_query_no_args()));
			validate_result(await validated_prerendered_query_no_args());
			validate_result(await validated_command_no_args());
			validate_result(await validated_query_with_arg('valid'));
			validate_result(await read_live(validated_live_query_with_arg('valid')));
			validate_result(await validated_prerendered_query_with_arg('valid'));
			validate_result(await validated_command_with_arg('valid'));
			validate_result(await validated_batch_query_no_validation('valid'));
			validate_result(await validated_batch_query_with_validation('valid'));
			$.set(status, 'success');
		} catch {
			$.set(status, 'error');
		}
	});

	$.delegated('click', button_1, async () => {
		$.set(status, 'pending');

		try {
			// @ts-expect-error
			await validated_query_no_args('invalid');

			$.set(status, 'error');
		} catch {
			try {
				// @ts-expect-error
				await read_live(validated_live_query_no_args('invalid'));

				$.set(status, 'error');
			} catch {
				try {
					// @ts-expect-error
					await validated_prerendered_query_no_args('invalid');

					$.set(status, 'error');
				} catch {
					try {
						// @ts-expect-error
						await validated_command_no_args('invalid');

						$.set(status, 'error');
					} catch {
						$.set(status, 'success');
					}
				}
			}
		}
	});

	$.delegated('click', button_2, async () => {
		$.set(status, 'pending');

		try {
			// @ts-expect-error
			await validated_query_with_arg(1);

			$.set(status, 'error');
		} catch(e) {
			if (!isHttpError(e) || e.body.message !== 'Input must be a string') {
				$.set(status, 'wrong error message');

				return;
			}

			try {
				// @ts-expect-error
				await read_live(validated_live_query_with_arg(1));

				$.set(status, 'error');
			} catch(e) {
				if (!isHttpError(e) || e.body.message !== 'Input must be a string') {
					$.set(status, 'wrong error message');

					return;
				}

				try {
					// @ts-expect-error
					await validated_prerendered_query_with_arg(1);

					$.set(status, 'error');
				} catch(e) {
					if (!isHttpError(e) || e.body.message !== 'Input must be a string') {
						$.set(status, 'wrong error message');

						return;
					}

					try {
						// @ts-expect-error
						await validated_command_with_arg(1);

						$.set(status, 'error');
					} catch(e) {
						if (!isHttpError(e) || e.body.message !== 'Input must be a string') {
							$.set(status, 'wrong error message');

							return;
						}

						try {
							// @ts-expect-error
							await validated_batch_query_with_validation(123);

							$.set(status, 'error');
						} catch(e) {
							if (!isHttpError(e) || e.body.message !== 'Input must be a string') {
								$.set(status, 'wrong error message');

								return;
							}

							$.set(status, 'success');
						}
					}
				}
			}
		}
	});

	$.delegated('click', button_3, async () => {
		$.set(status, 'pending');

		try {
			// @ts-expect-error
			validate_result(await validated_query_with_arg('valid', 'ignored'));

			validate_result(
				// @ts-expect-error
				await read_live(validated_live_query_with_arg('valid', 'ignored'))
			);

			validate_result(
				// @ts-expect-error
				await validated_prerendered_query_with_arg('valid', 'ignored')
			);

			// @ts-expect-error
			validate_result(await validated_command_with_arg('valid', 'ignored'));

			validate_result(
				// @ts-expect-error
				await validated_batch_query_no_validation('valid', 'ignored')
			);

			$.set(status, 'success');
		} catch {
			$.set(status, 'error');
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);