<script lang="ts">
	type ResolvedPathname = string & { __brand: 'resolved' };
	interface Props { href: ResolvedPathname }
	const { href }: Props = $props();
</script>

<a {href}>Click me!</a>
