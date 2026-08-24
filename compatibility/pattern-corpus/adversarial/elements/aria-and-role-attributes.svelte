<script>
  let expanded = $state(false);
</script>

<div
  role="button"
  tabindex="0"
  aria-expanded={expanded}
  aria-controls="p"
  onclick={() => (expanded = !expanded)}
  onkeydown={() => {}}
>
  toggle
</div>
<div id="p" role="region" aria-labelledby="l" aria-hidden={!expanded}>
  panel
</div>
<ul role="listbox" aria-multiselectable="false">
  <li role="option" aria-selected="true">a</li>
</ul>
<div
  role="progressbar"
  aria-valuemin="0"
  aria-valuemax="10"
  aria-valuenow="5"
></div>
<div role="alert" aria-live="assertive" aria-atomic="true">alert</div>
<input aria-describedby="d" aria-invalid="false" aria-required="true" />
<span id="l">label</span>
<span id="d">description</span>
