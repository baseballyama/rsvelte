import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import InlineLoading from "carbon-components-svelte/InlineLoading/InlineLoading.svelte";

var root = $.from_html(`<div data-testid="default-loader"><!></div> <div data-testid="loader-with-description"><!></div> <div data-testid="loader-active"><!></div> <div data-testid="loader-inactive"><!></div> <div data-testid="loader-finished"><!></div> <div data-testid="loader-custom-success-delay"><!></div> <div data-testid="loader-error"><!></div> <div data-testid="loader-custom-icon"><!></div>`, 1);

export default function InlineLoading_test($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	InlineLoading(node, {});
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	InlineLoading(node_1, { description: 'Loading metrics...' });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	InlineLoading(node_2, { status: 'active', description: 'Submitting...' });
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.child(div_3);

	InlineLoading(node_3, { status: 'inactive', description: 'Cancelling...' });
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_4 = $.child(div_4);

	InlineLoading(node_4, {
		status: 'finished',
		description: 'Success',
		$$events: {
			success: () => {
				console.log("success");
			}
		}
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_5 = $.child(div_5);

	InlineLoading(node_5, {
		status: 'finished',
		description: 'Processing...',
		successDelay: 500,
		$$events: {
			success: () => {
				console.log("success custom delay");
			}
		}
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_6 = $.child(div_6);

	InlineLoading(node_6, { status: 'error', description: 'An error occurred' });
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_7 = $.child(div_7);

	InlineLoading(node_7, {
		status: 'finished',
		description: 'Complete',
		iconDescription: 'Operation completed successfully'
	});

	$.reset(div_7);
	$.append($$anchor, fragment);
}