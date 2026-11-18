<script>
  const justifyClass = $derived(
    {
      center: 'justify-center',
      left: 'justify-start',
      right: 'justify-end',
    }[position] ?? 'justify-center',
  );
</script>
<p>{justifyClass}</p>