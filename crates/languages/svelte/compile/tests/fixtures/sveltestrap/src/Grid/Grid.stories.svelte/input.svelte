<script context="module">
  export const meta = {
    title: 'Stories/Grid',
    parameters: {},
    argTypes: {
      class: {
        className: 'string',
        table: { disable: true }
      },
      sm: {
        control: 'boolean'
      },
      md: {
        control: 'boolean'
      },
      lg: {
        control: 'boolean'
      },
      xl: {
        control: 'boolean'
      },
      xxl: {
        control: 'boolean'
      },
      fluid: {
        control: 'boolean'
      }
    },
    args: {
      sm: true,
      md: true,
      lg: true,
      xl: true,
      xxl: true,
      fluid: true
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { Col, Container, Row } from '@sveltestrap/sveltestrap';

  const cell = 'grid-cell';
  const row = 'grid-row';
</script>

<Story name="Basic">
  <div class="grid-example">
    <Container fluid>
      <Row noGutters class={row}>
        <Col>
          <div class={cell}>col</div>
        </Col>
      </Row>
      <Row noGutters class={row}>
        <Col>
          <div class={cell}>col</div>
        </Col>
        <Col>
          <div class={cell}>col</div>
        </Col>
        <Col>
          <div class={cell}>col</div>
        </Col>
        <Col>
          <div class={cell}>col</div>
        </Col>
      </Row>
      <Row noGutters class={row}>
        <Col xs="3">
          <div class={cell}>col-3</div>
        </Col>
        <Col xs="auto">
          <div class={cell}>col-auto</div>
        </Col>
        <Col xs="3">
          <div class={cell}>col-3</div>
        </Col>
      </Row>
      <Row noGutters class={row}>
        <Col xs="6">
          <div class={cell}>col-6</div>
        </Col>
        <Col xs="6">
          <div class={cell}>col-6</div>
        </Col>
      </Row>
      <Row noGutters class={row}>
        <Col xs="6" sm="4">
          <div class={cell}>col-6 col-sm-4</div>
        </Col>
        <Col xs="6" sm="4">
          <div class={cell}>col-6 col-sm-4</div>
        </Col>
        <Col sm="4">
          <div class={cell}>col-sm-4</div>
        </Col>
      </Row>
      <Row noGutters class={row}>
        <Col sm={{ size: 6, order: 2, offset: 1 }}>
          <div class={cell}>col-sm-6 order-sm-2 offset-sm-1</div>
        </Col>
      </Row>
      <Row noGutters class={row}>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <div class={cell}>col-sm-1 rounded2 col-md-6 offset-md-3</div>
        </Col>
      </Row>
      <Row noGutters class={row}>
        <Col sm={{ size: 'auto', offset: 1 }}>
          <div class={cell}>col-offset-sm-1</div>
        </Col>
        <Col sm={{ size: 'auto', offset: 1 }}>
          <div class={cell}>col-sm-auto offset-sm-1</div>
        </Col>
      </Row>
      <Row cols={2} class={row}>
        <Col>
          <div class={cell}>col-1</div>
        </Col>
        <Col>
          <div class={cell}>col-2</div>
        </Col>
        <Col>
          <div class={cell}>col-3</div>
        </Col>
        <Col>
          <div class={cell}>col-4</div>
        </Col>
        <Col>
          <div class={cell}>col-5</div>
        </Col>
        <Col>
          <div class={cell}>col-6</div>
        </Col>
      </Row>
      <Row cols={{ lg: 3, md: 2, sm: 1 }} class={row}>
        <Col>
          <div class={cell}>col-1</div>
        </Col>
        <Col>
          <div class={cell}>col-2</div>
        </Col>
        <Col>
          <div class={cell}>col-3</div>
        </Col>
        <Col>
          <div class={cell}>col-4</div>
        </Col>
        <Col>
          <div class={cell}>col-5</div>
        </Col>
        <Col>
          <div class={cell}>col-6</div>
        </Col>
      </Row>
    </Container>
  </div>
</Story>
