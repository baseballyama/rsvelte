import * as $ from 'svelte/internal/server';
import { Timeline, TimelineContent, TimelineItem } from '$lib/components/ui/timeline';
import BookOpenIcon from '@lucide/svelte/icons/book-open';
import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
import PencilIcon from '@lucide/svelte/icons/pencil';
import PlusIcon from '@lucide/svelte/icons/plus';
import Avatar02 from '$lib/assets/avatar-40-02.jpg?w=48&h=48&enhanced';

export default function Timeline_10($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<div class="space-y-3"><div class="text-muted-foreground text-xs font-medium">Activity</div> `);

		Timeline($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];
					const ActionIcon = getActionIcon(item.action);

					TimelineItem($$renderer, {
						step: item.id,
						class: 'm-0! flex-row items-center gap-3 py-2.5!',
						children: ($$renderer) => {
							if (ActionIcon) {
								$$renderer.push('<!--[-->');
								ActionIcon($$renderer, { class: 'text-muted-foreground/80', size: 16 });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <enhanced:img${$.attr('src', item.image)}${$.attr('alt', item.user)} class="size-6 rounded-full"></enhanced:img> `);

							TimelineContent($$renderer, {
								class: 'text-foreground',
								children: ($$renderer) => {
									$$renderer.push(`<a class="font-medium hover:underline" href="#">${$.escape(item.user)}</a> <span class="font-normal">${$.escape(getActionText(item.action))} <a class="hover:underline" href="#">${$.escape(getRelativeTimeString(item.date))}</a></span>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}