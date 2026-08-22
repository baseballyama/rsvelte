<script>
  class Box {
    #value = 1;

    static read(other) {
      return other?.#value;
    }
  }

  const value = Box.read(null);
</script>

<b>{value}</b>
