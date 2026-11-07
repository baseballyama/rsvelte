import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { applyAction, enhance } from '$app/forms';
import { invalidateAll } from '$app/navigation';
import { loading } from '$state/loading';
import toast from 'svelte-french-toast';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'global',
	'confirm',
	'children'
]);

var root = $.from_html(`<form><!></form>`);

export default function FormWithLoader($$anchor, $$props) {
	$.push($$props, true);

	let formLoading = $.state(false);

	let global = $.prop($$props, 'global', 3, true),
		confirm = $.prop($$props, 'confirm', 3, ''),
		rest = $.rest_props($$props, rest_excludes);

	const form_action = (opts, callback) => {
		return function form_enhance({ cancel }) {
			if (global()) {
				loading.setLoading(true);
			}

			if (confirm()) {
				if (!window.confirm(confirm())) {
					return cancel();
				}
			}

			$.set(formLoading, true);

			return async ({ result }) => {
				if (result.type === 'success') {
					toast.success('Siiiiick ' + result.data.message + ' was a success');
				} else if (result.type === 'error') {
					console.log(result);
					toast.error(`Major bummer: ${result.error.message}`);
				} else {
					toast.error(`Something went wrong. Check the console`);
					console.log(result);
				}

				await invalidateAll();
				await applyAction(result);
				$.set(formLoading, false);

				if (global()) {
					loading.setLoading(false);
				}

				if (callback && 'data' in result && result?.data) callback(result.data);
			};
		};
	};

	var $$exports = { form_action };
	var form = root();

	$.attribute_effect(form, () => ({ ...rest }));

	var node = $.child(form);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ loading: $.get(formLoading) }));
	$.reset(form);
	$.action(form, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), form_action);
	$.append($$anchor, form);

	return $.pop($$exports);
}