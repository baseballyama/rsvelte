<script lang="ts">
	interface Props { greeting: string }
	const props: Props = $props();
</script>
<p>{ props.greeting}</p>