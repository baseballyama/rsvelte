<!--
	@component
	A component whose doc comment spans lines.

	```svelte
	<Doc />
	```
-->
<script>
  let href = $state("javascript:void 0");
</script>

<!-- svelte-ignore a11y_invalid_attribute -->
<a {href}>a</a>

<!-- svelte-ignore a11y_missing_attribute -->
<a>b</a>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div onclick={() => {}}>c</div>

<div>
  <!-- svelte-ignore a11y_missing_attribute -->
  <a>d</a>
</div>
