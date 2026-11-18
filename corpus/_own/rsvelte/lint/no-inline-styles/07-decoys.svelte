<script>
  const s = '<div style="color: red">in string</div>';
</script>

<!-- <div style="color: red">comment</div> -->
{@html s}
<div data-style="color: red">data attr ok</div>
<div styles="color: red">plural attr ok</div>
<div STYLE="color: red">uppercase attr name — exact match only</div>
