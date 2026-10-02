import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Download from '@lucide/svelte/icons/download';
import LoaderCircle from '@lucide/svelte/icons/loader-circle';

var root = $.from_html(`<!> Updating...`, 1);
var root_1 = $.from_html(`<!> Update now`, 1);
var root_2 = $.from_html(`<div class="bg-muted px-4 py-3 md:py-2"><div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"><p class="text-sm"><span class="font-medium">v2.1.0</span> <span class="text-muted-foreground mx-2">•</span> New features and improvements available</p> <!></div></div>`);

export default function Banner_12($$anchor) {
	let isDownloading = $.state(false);

	function handleDownload() {
		$.set(isDownloading, true);
		setTimeout(() => $.set(isDownloading, false), 2000);
	}

	var div = root_2();
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 2);

	Button(node, {
		size: 'sm',
		variant: 'outline',
		get disabled() {
			return $.get(isDownloading);
		},
		onclick: handleDownload,
		class: 'min-w-24',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					LoaderCircle(node_2, {
						class: '-ms-0.5 animate-spin',
						size: 16,
						'aria-hidden': 'true'
					});

					$.next();
					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					var fragment_2 = root_1();
					var node_3 = $.first_child(fragment_2);

					Download(node_3, { size: 16, class: '-ms-0.5', 'aria-hidden': 'true' });
					$.next();
					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(isDownloading)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}