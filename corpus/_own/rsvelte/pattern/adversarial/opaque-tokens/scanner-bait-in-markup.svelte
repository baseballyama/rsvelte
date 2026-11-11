<script>
  let v = $state(1);
</script>

<p>{"{#if true}{/if}"}</p>
<p>{"$.set(x, 1)"}</p>
<p>{"$$async_hole"}</p>
<p>{"svelte-ignore a11y_no_static_element_interactions"}</p>
<p>{"</" + "script>"}</p>
<p title={"=> await"} data-x={"class Fake {"}>{v}</p>
<!-- svelte-ignore a11y_missing_attribute -->
<a>anchor without href</a>
