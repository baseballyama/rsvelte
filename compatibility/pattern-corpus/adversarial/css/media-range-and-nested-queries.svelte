<div class="host">a</div>

<style>
  @media (width >= 100px) {
    .host {
      color: red;
    }
  }

  @media (100px <= width <= 200px) {
    .host {
      color: blue;
    }
  }

  @media not all and (monochrome) {
    .host {
      color: green;
    }
  }

  @media screen and (min-width: 100px), print and (orientation: landscape) {
    .host {
      color: teal;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .host {
      transition: none;
    }
  }

  @media (min-resolution: 2dppx) {
    .host {
      color: olive;
    }
  }

  @media (min-width: 100px) {
    @media (max-width: 300px) {
      .host {
        color: navy;
      }
    }
  }

  .host {
    @media (min-width: 100px) {
      color: maroon;
    }
  }
</style>
