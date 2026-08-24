<script>
  let expanded = $state(false);
  let value = $state("v");
</script>

<button
  aria-expanded={expanded}
  aria-controls="panel"
  aria-label="toggle"
  aria-describedby="hint"
  aria-live="polite"
  aria-atomic="true"
  aria-busy={expanded}
  aria-current="page"
  aria-disabled="false"
  aria-hidden={expanded}
>
  a
</button>

<div id="panel" role="region" aria-labelledby="label" tabindex="-1">b</div>
<div role="presentation" aria-roledescription="custom">c</div>

<div
  data-simple="1"
  data-with-dashes="2"
  data-camelCase="3"
  data-UPPER="4"
  data-value={value}
  data-0="5"
  data-a-b-c-d="6"
  data-="7"
>
  d
</div>
