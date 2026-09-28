<script lang="ts">
	import type { ViewSectionProps } from '$lib/props';

	type Props = {
		props: ViewSectionProps;
	};

	let { props }: Props = $props();
</script>

<h3 class="px-4 pt-2.5 pb-1 text-xs font-semibold text-gray-500 uppercase">
	{props.title}
</h3>
