<script lang="ts">
	export let title: string;
	function scoped() {
		interface $$Slots {
			default: Record<string, never>;
		}
		return null as unknown as $$Slots;
	}
	void scoped;
</script>
<h1>{title}</h1>
<slot />
