<script>
  export let filter;
  filter.onRemove = () => {
    remove(filter.index);
  };
</script>

<p>{filter.index}</p>
