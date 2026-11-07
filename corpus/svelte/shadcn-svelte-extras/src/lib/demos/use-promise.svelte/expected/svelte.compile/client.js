import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PMCommand } from '$lib/components/ui/pm-command';
import { UsePromise } from '$lib/hooks/use-promise.svelte';
import { onMount } from 'svelte';

var root = $.from_html(`<div class="w-full p-6"><!></div>`);

export default function Use_promise($$anchor, $$props) {
	$.push($$props, true);

	let resolve = $.state(void 0);

	const promise = new Promise((res) => {
		$.set(resolve, () => res('1.40.1'));
	});

	const version = new UsePromise(promise, '1.x.x');

	onMount(() => {
		const timeout = setTimeout(
			() => {
				$.get(resolve)?.();
			},
			2500
		);

		return () => {
			clearTimeout(timeout);
		};
	});

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => [
			`jsrepo@${version.current}`,
			'add',
			'hooks/use-promise.svelte'
		]);

		PMCommand(node, {
			command: 'execute',
			get args() {
				return $.get($0);
			}
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}