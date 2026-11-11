<script lang="ts">
	function h() {}

	function go(el: EventTarget) {
		(el.addEventListener as (t: string, f: () => void) => void)('a', h);
		(el as EventTarget).addEventListener('b', h);
	}
</script>

<p>{typeof go}</p>
