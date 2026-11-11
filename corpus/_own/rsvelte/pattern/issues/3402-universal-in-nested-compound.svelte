<div class="card wide"><p class="a">x</p></div>

<style>
  .card {
    *.a {
      color: red;
    }

    & *.a {
      color: green;
    }
  }

  *.card > *.a {
    color: blue;
  }
</style>
