<script>
  let notaprop = true;
  const s = 'style:zzz="1"';
</script>

<div class:notaprop>class directive, not style</div>
<div style="zzz: 1">unknown prop in style attr — different rule</div>
<!-- style:zzz="1" in comment -->
<p>{s}</p>
