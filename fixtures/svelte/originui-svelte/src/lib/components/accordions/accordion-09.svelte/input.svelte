<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';

	import Bell from '@lucide/svelte/icons/bell';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import LifeBuoy from '@lucide/svelte/icons/life-buoy';
	import Link2 from '@lucide/svelte/icons/link-2';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import { Accordion as AccordionPrimitive } from 'bits-ui';

	const items = [
		{
			content:
				'Connect your accounts from Google, GitHub, or Microsoft to enable single sign-on and streamline your workflow. Connected accounts can be used for quick login and importing your preferences across platforms. You can revoke access to any connected account at any time.',
			icon: Link2,
			id: '1',
			sub: 'Manage your linked social and work accounts',
			title: 'Connected accounts'
		},
		{
			content:
				'Choose which updates you want to receive. You can get notifications for: security alerts, billing updates, newsletter and product announcements, usage reports, and scheduled maintenance. Notifications can be delivered via email, SMS, or push notifications on your devices.',
			icon: Bell,
			id: '2',
			sub: 'Customize your notification preferences',
			title: 'Notifications'
		},
		{
			content:
				'Protect your account with two-factor authentication. You can use authenticator apps like Google Authenticator or Authy, receive SMS codes, or use security keys like YubiKey. We recommend using an authenticator app for the most secure experience.',
			icon: ShieldCheck,
			id: '3',
			sub: 'Add an extra layer of security to your account',
			title: '2-step verification'
		},
		{
			content:
				'Our support team is available around the clock to assist you. For billing inquiries, technical issues, or general questions, you can reach us through live chat, email at support@example.com, or schedule a call with our technical team. Premium support is available for enterprise customers.',
			icon: LifeBuoy,
			id: '4',
			sub: "We're here to help 24/7",
			title: 'Contact support'
		}
	];
</script>

<div class="space-y-4">
	<h2 class="text-xl font-bold">W/ icon, sub-header, and chevron</h2>
	<Accordion.Root type="single" class="w-full" value="3">
		{#each items as item (item.id)}
			<Accordion.Item value={item.id} class="py-2">
				<AccordionPrimitive.Header class="flex">
					<AccordionPrimitive.Trigger
						class="flex flex-1 items-center justify-between py-2 text-left text-[15px] leading-6 font-semibold transition-all [&[data-state=open]>svg]:rotate-180"
					>
						<span class="flex items-center gap-3">
							<span
								class="border-border flex size-10 shrink-0 items-center justify-center rounded-full border"
								aria-hidden="true"
							>
								<item.icon size={16} class="opacity-60" />
							</span>
							<span class="flex flex-col space-y-1">
								<span>{item.title}</span>
								{#if item.sub}
									<span class="text-sm font-normal">{item.sub}</span>
								{/if}
							</span>
						</span>
						<ChevronDown
							size={16}
							class="shrink-0 opacity-60 transition-transform duration-200"
							aria-hidden="true"
						/>
					</AccordionPrimitive.Trigger>
				</AccordionPrimitive.Header>
				<Accordion.Content class="text-muted-foreground ms-3 ps-10 pb-2">
					{item.content}
				</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
</div>
