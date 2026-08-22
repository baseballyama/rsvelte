<script lang="ts">
	interface Props {
		data: unknown;
		junk: string;
	}
	let { data, junk }: Props = $props();
	void [data, junk];
</script>
<p>ts</p>
