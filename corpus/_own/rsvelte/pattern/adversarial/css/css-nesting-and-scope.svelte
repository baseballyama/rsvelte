<article class="card">
  <h1 class="title">t</h1>
  <p class="body">b</p>
</article>

<style>
  .card {
    color: black;

    & .title {
      font-weight: bold;
    }

    &:hover .body {
      color: gray;
    }

    > .body {
      margin: 0;
    }

    @media (min-width: 1px) {
      & .title {
        font-size: 2rem;
      }
    }
  }
</style>
