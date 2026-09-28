<script lang="ts">
	import Input from '../ui/input.svelte';
	import Textarea from '../ui/textarea.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import { useCharacterLimit } from '$lib/hooks/use-character-limit.svelte';
	import { useImageUpload } from '$lib/hooks/use-image-upload.svelte';

	import Check from '@lucide/svelte/icons/check';
	import ImagePlus from '@lucide/svelte/icons/image-plus';
	import X from '@lucide/svelte/icons/x';
	import * as Dialog from '$lib/components/ui/dialog';

	const bioLimit = useCharacterLimit(
		180,
		'Hey, I am Margaret, a web developer who loves turning ideas into amazing websites!'
	);
	const bannerImageHandler = useImageUpload({ initialImage: '/profile-bg.jpg' });
	const profileImageHandler = useImageUpload({ initialImage: '/avatar-72-01.jpg' });

	const id = $props.id();
</script>

<Dialog.Root>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button variant="outline" class={buttonVariants({ variant: 'outline' })} {...props}
				>Edit profile</Button
			>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content
		class="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5"
	>
		<Dialog.Header class="contents space-y-0 text-left">
			<Dialog.Title class="border-b px-6 py-4 text-base">Edit profile</Dialog.Title>
		</Dialog.Header>
		<Dialog.Description class="sr-only">
			Make changes to your profile here. You can change your photo and set a username.
		</Dialog.Description>

		<div class="overflow-y-auto">
			{@render ProfileBg()}
			{@render Avatar()}
			<div class="px-6 pt-4 pb-6">
				<form class="space-y-4">
					<div class="flex flex-col gap-4 sm:flex-row">
						<div class="flex-1 space-y-2">
							<Label for="{id}-first-name">First name</Label>
							<Input
								id="{id}-first-name"
								placeholder="Matt"
								defaultValue="Margaret"
								type="text"
								required
							/>
						</div>
						<div class="flex-1 space-y-2">
							<Label for="{id}-last-name">Last name</Label>
							<Input
								id="{id}-last-name"
								placeholder="Welsh"
								defaultValue="Villard"
								type="text"
								required
							/>
						</div>
					</div>
					<div class="*:not-first:mt-2">
						<Label for="{id}-username">Username</Label>
						<div class="relative">
							<Input
								id="{id}-username"
								class="peer pe-9"
								placeholder="Username"
								defaultValue="margaret-villard-69"
								type="text"
								required
							/>
							<div
								class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50"
							>
								<Check size={16} class="text-emerald-500" aria-hidden="true" />
							</div>
						</div>
					</div>
					<div class="*:not-first:mt-2">
						<Label for="{id}-website">Website</Label>
						<div class="flex rounded-lg shadow-xs shadow-black/5">
							<span
								class="border-input bg-background text-muted-foreground -z-10 inline-flex items-center rounded-s-md border px-3 text-sm"
							>
								https://
							</span>
							<Input
								id="{id}-website"
								class="-ms-px rounded-s-none shadow-none"
								placeholder="yourwebsite.com"
								defaultValue="www.margaret.com"
								type="text"
							/>
						</div>
					</div>
					<div class="*:not-first:mt-2">
						<Label for="{id}-bio">Biography</Label>
						<Textarea
							id="{id}-bio"
							bind:value={bioLimit.value}
							maxlength={bioLimit.maxLength}
							placeholder="Write a few sentences about yourself"
							aria-describedby="{id}-left-textarea"
						/>
						<p
							id="{id}-left-textarea"
							class="text-muted-foreground mt-2 text-right text-xs"
							role="status"
							aria-live="polite"
						>
							<span class="tabular-nums">{bioLimit.maxLength - bioLimit.characterCount}</span>
							characters left
						</p>
					</div>
				</form>
			</div>
		</div>
		<Dialog.Footer class="border-t px-6 py-4">
			<Dialog.Close>
				{#snippet child({ props })}
					<Button type="button" variant="outline" {...props}>Cancel</Button>
				{/snippet}
			</Dialog.Close>
			<Dialog.Close>
				{#snippet child({ props })}
					<Button type="button" {...props}>Save changes</Button>
				{/snippet}
			</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

{#snippet ProfileBg()}
	<div class="h-32">
		<div class="bg-muted relative flex h-full w-full items-center justify-center overflow-hidden">
			{#if bannerImageHandler.previewUrl}
				<img
					class="h-full w-full object-cover"
					src={bannerImageHandler.previewUrl}
					alt={bannerImageHandler.fileName
						? 'Preview of uploaded image'
						: 'Default profile background'}
					width={512}
					height={96}
				/>
			{/if}

			<div class="absolute inset-0 flex items-center justify-center gap-2">
				<button
					type="button"
					class="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
					onclick={bannerImageHandler.handleThumbnailClick}
					aria-label={bannerImageHandler.previewUrl ? 'Change image' : 'Upload image'}
				>
					<ImagePlus size={16} aria-hidden="true" />
				</button>
				{#if bannerImageHandler}
					<button
						type="button"
						class="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
						onclick={bannerImageHandler.handleRemove}
						aria-label="Remove image"
					>
						<X size={16} aria-hidden="true" />
					</button>
				{/if}
			</div>
		</div>
		<input
			bind:this={bannerImageHandler.fileInput}
			bind:files={bannerImageHandler.files}
			type="file"
			class="hidden"
			accept="image/*"
			aria-label="Upload image file"
		/>
	</div>
{/snippet}

{#snippet Avatar()}
	<div class="-mt-10 px-6">
		<div
			class="border-background bg-muted relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 shadow-xs shadow-black/10"
		>
			{#if profileImageHandler.previewUrl}
				<img
					src={profileImageHandler.previewUrl}
					class="size-full object-cover"
					width={80}
					height={80}
					alt="Profile avatar"
				/>
			{/if}
			<button
				type="button"
				class="focus-visible:border-ring focus-visible:ring-ring/50 absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
				onclick={profileImageHandler.handleThumbnailClick}
				aria-label="Change profile picture"
			>
				<ImagePlus size={16} aria-hidden="true" />
			</button>
			<input
				type="file"
				bind:this={profileImageHandler.fileInput}
				bind:files={profileImageHandler.files}
				class="hidden"
				accept="image/*"
				aria-label="Upload profile picture"
			/>
		</div>
	</div>
{/snippet}
