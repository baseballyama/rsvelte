import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Timeline, TimelineContent, TimelineItem } from '$lib/components/ui/timeline';
import BookOpenIcon from '@lucide/svelte/icons/book-open';
import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
import PencilIcon from '@lucide/svelte/icons/pencil';
import PlusIcon from '@lucide/svelte/icons/plus';
import Avatar02 from '$lib/assets/avatar-40-02.jpg?w=48&h=48&enhanced';

var root = $.from_html(`<a class="font-medium hover:underline" href="#"> </a> <span class="font-normal"> <a class="hover:underline" href="#"> </a></span>`, 1);
var root_1 = $.from_html(`<!> <enhanced:img class="size-6 rounded-full"></enhanced:img> <!>`, 1);
var root_2 = $.from_html(`<div class="space-y-3"><div class="text-muted-foreground text-xs font-medium">Activity</div> <!></div>`);

export default function Timeline_10($$anchor, $$props) {
	$.push($$props, true);

	const items = [
		{
			action: 'post',
			date: new Date(Date.now() - 59000), // 59 seconds ago
			id: 1,
			image: Avatar02,
			user: 'Matt'
		},

		{
			action: 'reply',
			date: new Date(Date.now() - 180000), // 3 minutes ago
			id: 2,
			image: Avatar02,
			user: 'Matt'
		},

		{
			action: 'edit',
			date: new Date(Date.now() - 300000), // 5 minutes ago
			id: 3,
			image: Avatar02,
			user: 'Matt'
		},

		{
			action: 'create',
			date: new Date(Date.now() - 600000), // 10 minutes ago
			id: 4,
			image: Avatar02,
			user: 'Matt'
		}
	];

	function getActionIcon(action) {
		const icons = {
			create: PlusIcon,
			edit: PencilIcon,
			post: BookOpenIcon,
			reply: MessageCircleIcon
		};

		return icons[action];
	}

	function getActionText(action) {
		const texts = {
			create: 'created a new project',
			edit: 'edited a post',
			post: 'wrote a new post',
			reply: 'replied to a comment'
		};

		return texts[action];
	}

	function getRelativeTimeString(date) {
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) {
			return `${diffInSeconds} seconds ago`;
		} else if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60);

			return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
		} else if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);

			return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
		} else {
			const days = Math.floor(diffInSeconds / 86400);

			return `${days} ${days === 1 ? 'day' : 'days'} ago`;
		}
	}

	var div = root_2();
	var node = $.sibling($.child(div), 2);

	Timeline(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => items, (item) => item.id, ($$anchor, item) => {
				const ActionIcon = $.derived(() => getActionIcon($.get(item).action));

				TimelineItem($$anchor, {
					get step() {
						return $.get(item).id;
					},
					class: 'm-0! flex-row items-center gap-3 py-2.5!',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => $.get(ActionIcon), ($$anchor, ActionIcon_1) => {
							ActionIcon_1($$anchor, { class: 'text-muted-foreground/80', size: 16 });
						});

						var enhanced_img = $.sibling(node_2, 2);
						var node_3 = $.sibling(enhanced_img, 2);

						TimelineContent(node_3, {
							class: 'text-foreground',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var a = $.first_child(fragment_3);
								var text = $.only_child(a, true);
								var span = $.sibling(a, 2);
								var text_1 = $.child(span);
								var a_1 = $.sibling(text_1);
								var text_2 = $.only_child(a_1, true);

								$.reset(span);

								$.template_effect(
									($0, $1) => {
										$.set_text(text, $.get(item).user);
										$.set_text(text_1, `${$0 ?? ''} `);
										$.set_text(text_2, $1);
									},
									[
										() => getActionText($.get(item).action),
										() => getRelativeTimeString($.get(item).date)
									]
								);

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});

						$.template_effect(() => {
							$.set_attribute(enhanced_img, 'src', $.get(item).image);
							$.set_attribute(enhanced_img, 'alt', $.get(item).user);
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}