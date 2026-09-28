<script lang="ts">
	import type { UINode } from '$lib/types';
	import { useTypedNode } from '$lib/node.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import { serializeEvent } from './utils';
	import { imperativeBus } from '$lib/imperative.svelte';
	import { getContext, untrack } from 'svelte';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
		onDispatch: (instanceId: number, handlerName: string, args: unknown[]) => void;
	};

	let { nodeId, uiTree, onDispatch }: Props = $props();

	const { props: componentProps } = $derived.by(
		useTypedNode(() => ({ nodeId, uiTree, type: 'Form.TextArea' }))
	);
	const { register } = getContext<{ register: (id: string, value: unknown) => void }>(
		'form-context'
	);

	const isControlled = $derived(componentProps?.value !== undefined);

	let internalValue = $state('');
	let isInitialized = false;
	let textareaRef: HTMLTextAreaElement | null = $state(null);

	$effect(() => {
		if (componentProps && !isInitialized && !isControlled) {
			internalValue = componentProps.defaultValue ?? '';
			isInitialized = true;
		}
	});

	const displayValue = $derived(isControlled ? componentProps?.value : internalValue);

	$effect(() => {
		if (componentProps) {
			register(componentProps.id, displayValue);
		}
	});

	function onInput(e: Event) {
		const newValue = (e.target as HTMLTextAreaElement).value;
		if (!isControlled) {
			internalValue = newValue;
		}
		onDispatch(nodeId, 'onChange', [newValue]);
	}

	$effect(() => {
		const cmd = imperativeBus.command;
		if (cmd && cmd.nodeId === nodeId) {
			if (cmd.command === 'focus') {
				textareaRef?.focus();
			} else if (cmd.command === 'reset') {
				if (!untrack(() => isControlled)) {
					internalValue = untrack(() => componentProps?.defaultValue ?? '');
				}
			}
		}
	});
</script>

{#if componentProps}
	<div class="flex gap-4">
		<label
			for={componentProps.id}
			class="text-muted-foreground pt-2 text-right text-sm font-medium"
		>
			{componentProps.title}
		</label>
		<div class="w-full">
			<Textarea
				bind:ref={textareaRef}
				id={componentProps.id}
				placeholder={componentProps.placeholder}
				value={displayValue ?? ''}
				oninput={onInput}
				onblur={(e) => onDispatch(nodeId, 'onBlur', [serializeEvent(componentProps.id, e)])}
				aria-invalid={!!componentProps.error}
			/>
			{#if componentProps.error}
				<p class="mt-1 text-xs text-red-600">{componentProps.error}</p>
			{/if}
			{#if componentProps.info}
				<p class="mt-1 text-xs text-gray-500">{componentProps.info}</p>
			{/if}
		</div>
	</div>
{/if}
