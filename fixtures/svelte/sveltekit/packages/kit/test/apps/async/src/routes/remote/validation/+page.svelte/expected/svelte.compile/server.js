import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let status = 'pending';

		$$renderer.push(`<p>${$.escape(status)}</p> <button>valid</button> <button>invalid (arg when no args expected)</button> <button>invalid (wrong arg type)</button> <button>ignored (more than one arg, only one sent to backend)</button>`);
	});
}