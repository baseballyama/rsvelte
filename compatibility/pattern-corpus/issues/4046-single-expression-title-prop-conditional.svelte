<!--
  A `<title>` whose fragment is exactly one expression tag takes a different
  branch of `title_element.rs` than `legacy-prop-member-title.svelte` (which has
  surrounding whitespace text nodes and so builds a template literal). Upstream
  asks `scope.evaluate(value).is_defined` of the BUILT value in both, and a
  legacy prop read builds to a `SequenceExpression` that `evaluate` has no case
  for — so the `?? ''` must survive even though both arms of the conditional are
  strings in the source.
-->
<script>
	export let data;
</script>

<svelte:head>
	<title
		>{data.props && data.props.country ? `Regions in ${data.props.country.name}` : 'Regions'}</title
	>
</svelte:head>
