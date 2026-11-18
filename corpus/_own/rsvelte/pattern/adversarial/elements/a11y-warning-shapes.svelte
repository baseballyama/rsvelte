<script>
  let v = $state(1);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onclick={() => (v += 1)}>a</div>

<!-- svelte-ignore a11y_missing_attribute -->
<a>b</a>

<!-- svelte-ignore a11y_img_redundant_alt -->
<img src="a.png" alt="Photo of a thing" />

<!-- svelte-ignore a11y_label_has_associated_control -->
<label>c</label>

<!-- svelte-ignore a11y_media_has_caption -->
<video></video>

<!-- svelte-ignore a11y_positive_tabindex -->
<button tabindex="1">d</button>

<b>{v}</b>
