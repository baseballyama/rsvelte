import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePreviewControls } from "@components/preview-ctx.svelte";
import Preview from "@components/preview.svelte";
import { getters, mergeAttrs } from "melt";
import { Avatar } from "melt/builders";
import { Debounced } from "runed";

var root = $.from_html(`<div class="flex flex-col items-center"><div class="flex w-full items-center justify-center gap-6"><div class="relative flex size-32 items-center justify-center overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-100"><img/> <span> </span></div></div> <label for="gh" class="mt-4">GitHub username</label> <span contenteditable="" id="gh" class="focus:border-accent-200 w-auto border-b-2 border-neutral-600 bg-transparent px-1 pb-1 text-center text-2xl
			font-light placeholder-neutral-500 outline-none transition dark:text-white" spellcheck="false"></span> <span>invalid username</span></div>`);

export default function Avatar_1($$anchor, $$props) {
	$.push($$props, true);

	const controls = usePreviewControls({
		delayMs: { label: "Delay (ms)", type: "number", defaultValue: 650 }
	});

	let username = $.state("tglide");
	const src = new Debounced(() => `https://github.com/${$.get(username)}.png`, 500);

	const getInitials = (username) => {
		// Handle empty strings
		if (!username) return "";

		// Split by common separators and handle camelCase/PascalCase
		const parts = username.// Insert space before capitals in camelCase/PascalCase
		replace(/([a-z])([A-Z])/g, "$1 $2").// Split by common separators
		split(/[\s\-_/.]+/).// Remove empty parts
		filter((part) => part.length > 0);

		// Get first letter of first part
		const firstInitial = parts[0]?.[0]?.toUpperCase() || "";

		// Get first letter of last part if different from first part
		const lastInitial = parts.length > 1 ? parts[parts.length - 1]?.[0]?.toUpperCase() : "";

		return firstInitial + (lastInitial === firstInitial ? "" : lastInitial);
	};

	const initials = $.derived(() => getInitials($.get(username)));
	const avatar = new Avatar({ src: () => src.current, ...getters(controls) });

	Preview($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var img = $.child(div_2);

			$.attribute_effect(
				img,
				($0) => ({
					...$0,
					alt: 'Avatar',
					class: [
						"absolute inset-0 !block h-full w-full rounded-[inherit] ",
						avatar.loadingStatus === "loaded" ? "fade-in" : "invisible"
					]
				}),
				[
					() => mergeAttrs(avatar.image, {
						onload: () => {
							console.log("loaded");
						}
					})
				],
				void 0,
				void 0,
				'svelte-1yyvp2u'
			);

			var span = $.sibling(img, 2);

			$.attribute_effect(
				span,
				() => ({
					...avatar.fallback,
					class: '!block text-4xl font-medium text-neutral-700'
				}),
				void 0,
				void 0,
				void 0,
				'svelte-1yyvp2u'
			);

			var text = $.only_child(span, true);

			$.reset(div_2);
			$.reset(div_1);

			var span_1 = $.sibling(div_1, 4);
			var span_2 = $.sibling(span_1, 2);

			$.reset(div);

			$.template_effect(() => {
				$.set_text(text, $.get(initials));

				$.set_class(span_2, 1, $.clsx([
					"mt-2 text-red-300",
					avatar.loadingStatus !== "error" && "pointer-events-none opacity-0"
				]));
			});

			$.replay_events(img);
			$.bind_content_editable('innerText', span_1, () => $.get(username), ($$value) => $.set(username, $$value));
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}