import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	$.template_effect(() => {
		console.log({ myfile: $.snapshot(myfile) });

		debugger;
	});

	$.template_effect(() => {
		console.log({
			myfile: $.snapshot(myfile),
			someOtherFile: $.snapshot(someOtherFile)
		});

		debugger;
	});

	$.template_effect(() => {
		console.log({
			myfile: $.snapshot(myfile),
			someOtherFile: $.snapshot(someOtherFile),
			someThirdFile: $.snapshot(someThirdFile)
		});

		debugger;
	});
}