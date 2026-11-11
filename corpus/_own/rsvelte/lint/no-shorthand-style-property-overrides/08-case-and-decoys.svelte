<script>
  const s = 'margin-top: 1; margin: 0';
</script>

<div style="MARGIN-TOP: 1px; margin: 0">case differs, no match either way</div>
<div style="margintop: 1; margin: 0">not a longhand, ok</div>
<p>{s}</p>
<!-- style="margin-top: 1; margin: 0" -->
