<script>
  import {
    Accordion,
    AccordionItem,
    Alert,
    Badge,
    Breadcrumb,
    BreadcrumbItem,
    Button,
    ButtonDropdown,
    ButtonGroup,
    ButtonToolbar,
    Card,
    CardBody,
    CardColumns,
    CardDeck,
    CardFooter,
    CardGroup,
    CardHeader,
    CardImg,
    CardImgOverlay,
    CardLink,
    CardSubtitle,
    CardText,
    CardTitle,
    Carousel,
    CarouselCaption,
    CarouselControl,
    CarouselIndicators,
    CarouselItem,
    Col,
    Collapse,
    Column,
    Container,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Fade,
    Figure,
    Form,
    FormCheck,
    FormFeedback,
    FormGroup,
    FormText,
    Icon,
    Image,
    InlineContainer,
    Input,
    InputGroup,
    InputGroupText,
    Jumbotron,
    Label,
    ListGroup,
    ListGroupItem,
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Nav,
    Navbar,
    NavItem,
    NavLink,
    NavbarBrand,
    NavbarToggler,
    Offcanvas,
    OffcanvasBackdrop,
    OffcanvasBody,
    OffcanvasHeader,
    Pagination,
    PaginationItem,
    PaginationLink,
    Popover,
    Portal,
    Progress,
    Row,
    Spinner,
    Styles,
    Table,
    TabContent,
    TabPane,
    Toast,
    ToastBody,
    ToastHeader,
    Tooltip
  } from '@sveltestrap/sveltestrap';

  const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

  const carouselItems = [
    {
      url: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa1d%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa1d%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.921875%22%20y%3D%22218.3%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
      title: 'Slide 1',
      subTitle: 'Slide 1'
    },
    {
      url: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa20%20text%20%7B%20fill%3A%23444%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa20%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23666%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22247.3203125%22%20y%3D%22218.3%22%3ESecond%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
      title: 'Slide 2',
      subTitle: 'Slide 2'
    },
    {
      url: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa21%20text%20%7B%20fill%3A%23333%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa21%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23555%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22277%22%20y%3D%22218.3%22%3EThird%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
      title: 'Slide 3',
      subTitle: 'Slide 3'
    }
  ];

  const items = [
    'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa1d%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa1d%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22285.921875%22%20y%3D%22218.3%22%3EFirst%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
    'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa20%20text%20%7B%20fill%3A%23444%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa20%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23666%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22247.3203125%22%20y%3D%22218.3%22%3ESecond%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E',
    'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15ba800aa21%20text%20%7B%20fill%3A%23333%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15ba800aa21%22%3E%3Crect%20width%3D%22800%22%20height%3D%22400%22%20fill%3D%22%23555%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22277%22%20y%3D%22218.3%22%3EThird%20slide%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'
  ];

  let activeIndex = 0;
  let isDropdownOpen = false;
</script>

<main>
  <h1>Sveltestrap</h1>

  <section data-testid="accordion">
    <h2>Accordion</h2>

    <Accordion>
      <AccordionItem active>
        <h4 class="m-0" slot="header">Home</h4>
        Fallbrook
      </AccordionItem>
      <AccordionItem>
        <h4 class="m-0" slot="header">School</h4>
        <a href="#home">Buena Vista Elementary</a>
      </AccordionItem>
      <AccordionItem>
        <h4 class="m-0" slot="header">Library</h4>
        UCSB Library
      </AccordionItem>
    </Accordion>
  </section>

  <section data-testid="alert">
    <h2>Alerts</h2>

    {#each colors as color}
      <Alert {color}>
        <h4 class="alert-heading text-capitalize">{color}</h4>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        <a href="#todo" class="alert-link"> Also, alert-links are colored to match </a>
        .
      </Alert>
    {/each}
  </section>

  <section data-testid="badge">
    <h2>Badges</h2>

    {#each colors as color}
      <Badge {color}>{color}</Badge>
    {/each}
  </section>

  <section data-testid="breadcrumb">
    <h2>Breadcrumbs</h2>

    <Breadcrumb>
      <BreadcrumbItem active>Home</BreadcrumbItem>
    </Breadcrumb>

    <Breadcrumb>
      <BreadcrumbItem>
        <a href="#home">Home</a>
      </BreadcrumbItem>
      <BreadcrumbItem active>Library</BreadcrumbItem>
    </Breadcrumb>

    <Breadcrumb>
      <BreadcrumbItem>
        <a href="#home">Home</a>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <a href="#library">Library</a>
      </BreadcrumbItem>
      <BreadcrumbItem active>Data</BreadcrumbItem>
    </Breadcrumb>
  </section>

  <section data-testid="button">
    <h2>Buttons</h2>

    <Button>Hello World</Button>
    <Button color="primary">Hello World</Button>
    <Button color="warning">Hello World</Button>
    <Button color="danger">Hello World</Button>
    <Button>Hello World</Button>
  </section>

  <section data-testid="button-group">
    <h2>Button Group</h2>

    <ButtonGroup>
      <Button color="primary" active>Alpha</Button>
      <Button color="primary">Bravo</Button>
      <Button color="primary">Charlie</Button>
    </ButtonGroup>
  </section>

  <section data-testid="button-toolbar">
    <h2>Button Toolbar</h2>

    <ButtonToolbar>
      <Button color="primary">File</Button>
      <Button color="primary">Edit</Button>
      <Button color="primary">View</Button>
    </ButtonToolbar>
  </section>

  <section data-testid="card">
    <h2>Cards</h2>

    <Card class="mb-3">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
      </CardHeader>
      <CardBody>
        <CardSubtitle>Card subtitle</CardSubtitle>
        <CardText>
          Some quick example text to build on the card title and make up the bulk of the card's content.
        </CardText>
        <Button>Button</Button>
      </CardBody>
      <CardFooter>Footer</CardFooter>
    </Card>
  </section>

  <section data-testid="carousel">
    <h2>Carousel</h2>

    <div class="carousel-example">
      <div class="carousel-size">
        <Carousel {items} bind:activeIndex>
          <CarouselIndicators bind:activeIndex {items} />

          <div class="carousel-inner">
            {#each carouselItems as item, index}
              <CarouselItem bind:activeIndex itemIndex={index}>
                <img src={item.url} class="d-block w-100" alt={item.title} />
                <CarouselCaption captionHeader={item.title} captionText={item.subTitle} />
              </CarouselItem>
            {/each}
          </div>

          <CarouselControl direction="prev" bind:activeIndex {items} />
          <CarouselControl direction="next" bind:activeIndex {items} />
        </Carousel>
      </div>
    </div>
  </section>

  <section data-testid="dropdown">
    <h2>Dropdown</h2>

    <Dropdown isOpen={isDropdownOpen} toggle={() => (isDropdownOpen = !isDropdownOpen)}>
      <DropdownToggle color="primary" caret>Dropdown</DropdownToggle>
      <DropdownMenu>
        <DropdownItem header>Header</DropdownItem>
        <DropdownItem disabled>Action</DropdownItem>
        <DropdownItem>Another Action</DropdownItem>
        <DropdownItem divider />
        <DropdownItem>Another Action</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </section>
</main>

<Styles />

<style>
  main {
    display: grid;
    gap: 24px;
    grid-template-columns: 1fr;
    max-width: 800px;
    padding: 32px;
  }

  main,
  main * {
    box-sizing: border-box;
  }
</style>
