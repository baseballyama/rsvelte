<script lang="ts">
	import { goto } from '$app/navigation';
	type ResolvedPathname = string & { __brand: 'resolved' };
	const href = '/foo' as ResolvedPathname;
	goto(href);
</script>
