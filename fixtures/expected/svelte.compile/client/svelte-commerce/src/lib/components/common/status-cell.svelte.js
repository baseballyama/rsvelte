import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Undo, Package2 } from '@lucide/svelte';

var root = $.from_html(`<span class="relative mr-1 flex h-1.5 w-1.5"><span></span> <span></span></span>`);
var root_1 = $.from_html(`<span><!> </span>`);

export default function Status_cell($$anchor, $$props) {
	$.push($$props, true);

	const isPositiveStatus = $.derived(() => $$props.value?.toLowerCase() === 'active' || $$props.value?.toLowerCase() === 'true' || $$props.value?.toLowerCase() === 'yes' || $$props.value?.toLowerCase() === 'fulfilled' || $$props.value?.toLowerCase() === 'paid' || $$props.value?.toLowerCase() === 'delivered' || $$props.value?.toLowerCase() === 'published' || $$props.value?.toLowerCase() === 'confirmed');
	const isWarningStatus = $.derived(() => $$props.value?.toLowerCase() === 'processing' || $$props.value?.toLowerCase() === 'unpaid');
	const isPartiallyPaid = $.derived(() => $$props.value?.toLowerCase() === 'partially_paid');
	const isAuthorized = $.derived(() => $$props.value?.toLowerCase() === 'authorized');
	const isPending = $.derived(() => $$props.value?.toLowerCase() === 'pending');
	const isFulfilling = $.derived(() => $$props.value?.toLowerCase() === 'fulfilling');
	const isInfoStatus = $.derived(() => $$props.value?.toLowerCase() === 'shipped');
	const isRefunded = $.derived(() => $$props.value?.toLowerCase() === 'refunded');
	const isErrorStatus = $.derived(() => $$props.value?.toLowerCase() === 'failed' || $$props.value?.toLowerCase() === 'error' || $$props.value?.toLowerCase() === 'cancelled' || $$props.value?.toLowerCase() === 'rejected' || $$props.value?.toLowerCase() === 'false');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var span = root_1();
			var node_1 = $.child(span);

			{
				var consequent = ($$anchor) => {
					Undo($$anchor, { class: 'h-3 w-3 text-orange-600' });
				};

				var consequent_1 = ($$anchor) => {
					Package2($$anchor, { class: 'h-3 w-3 text-purple-600' });
				};

				var alternate = ($$anchor) => {
					var span_1 = root();
					var span_2 = $.child(span_1);
					var span_3 = $.sibling(span_2, 2);

					$.reset(span_1);

					$.template_effect(() => {
						$.set_class(span_2, 1, `absolute inline-flex h-full w-full animate-ping rounded-full ${$.get(isPositiveStatus)
							? 'bg-green-400'
							: $.get(isWarningStatus)
								? 'bg-yellow-400'
								: $.get(isPartiallyPaid)
									? 'bg-indigo-400'
									: $.get(isAuthorized)
										? 'bg-blue-400'
										: $.get(isPending)
											? 'bg-gray-400'
											: $.get(isInfoStatus)
												? 'bg-blue-400'
												: $.get(isErrorStatus) ? 'bg-red-400' : 'bg-gray-400'} opacity-75`);

						$.set_class(span_3, 1, `relative inline-flex h-1.5 w-1.5 rounded-full ${$.get(isPositiveStatus)
							? 'bg-green-500'
							: $.get(isWarningStatus)
								? 'bg-yellow-500'
								: $.get(isPartiallyPaid)
									? 'bg-indigo-500'
									: $.get(isAuthorized)
										? 'bg-blue-500'
										: $.get(isPending)
											? 'bg-gray-500'
											: $.get(isInfoStatus)
												? 'bg-blue-500'
												: $.get(isErrorStatus) ? 'bg-red-500' : 'bg-gray-500'}`);
					});

					$.append($$anchor, span_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(isRefunded)) $$render(consequent); else if ($.get(isFulfilling)) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			var text = $.sibling(node_1);

			$.reset(span);

			$.template_effect(() => {
				$.set_class(span, 1, `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${$.get(isPositiveStatus)
					? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
					: $.get(isWarningStatus)
						? 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
						: $.get(isPartiallyPaid)
							? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20'
							: $.get(isAuthorized)
								? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
								: $.get(isPending)
									? 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'
									: $.get(isFulfilling)
										? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20'
										: $.get(isInfoStatus)
											? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
											: $.get(isErrorStatus)
												? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
												: $.get(isRefunded)
													? 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20'
													: 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'}`);

				$.set_text(text, ` ${$$props.value ?? ''}`);
			});

			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($$props.value) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}