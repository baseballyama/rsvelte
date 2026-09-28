import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<h4 class="m-0 svelte-u8rdjy" slot="header">Home</h4>`);
var root_1 = $.from_html(`<a href="#home" class="svelte-u8rdjy">Buena Vista Elementary</a>`);
var root_2 = $.from_html(`<h4 class="m-0 svelte-u8rdjy" slot="header">School</h4>`);
var root_3 = $.from_html(`<h4 class="m-0 svelte-u8rdjy" slot="header">Library</h4>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<h4 class="alert-heading text-capitalize svelte-u8rdjy"> </h4> Lorem ipsum dolor sit amet, consectetur adipiscing elit. <a href="#todo" class="alert-link svelte-u8rdjy">Also, alert-links are colored to match</a> .`, 1);
var root_6 = $.from_html(`<a href="#home" class="svelte-u8rdjy">Home</a>`);
var root_7 = $.from_html(`<!> <!>`, 1);
var root_8 = $.from_html(`<a href="#library" class="svelte-u8rdjy">Library</a>`);
var root_9 = $.from_html(`<img class="d-block w-100 svelte-u8rdjy"/> <!>`, 1);
var root_10 = $.from_html(`<!> <div class="carousel-inner svelte-u8rdjy"></div> <!> <!>`, 1);
var root_11 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_12 = $.from_html(`<main class="svelte-u8rdjy"><h1 class="svelte-u8rdjy">Sveltestrap</h1> <section data-testid="accordion" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Accordion</h2> <!></section> <section data-testid="alert" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Alerts</h2> <!></section> <section data-testid="badge" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Badges</h2> <!></section> <section data-testid="breadcrumb" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Breadcrumbs</h2> <!> <!> <!></section> <section data-testid="button" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Buttons</h2> <!> <!> <!> <!> <!></section> <section data-testid="button-group" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Button Group</h2> <!></section> <section data-testid="button-toolbar" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Button Toolbar</h2> <!></section> <section data-testid="card" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Cards</h2> <!></section> <section data-testid="carousel" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Carousel</h2> <div class="carousel-example svelte-u8rdjy"><div class="carousel-size svelte-u8rdjy"><!></div></div></section> <section data-testid="dropdown" class="svelte-u8rdjy"><h2 class="svelte-u8rdjy">Dropdown</h2> <!></section></main> <!>`, 1);

export default function _page($$anchor) {
	const colors = [
		'primary',
		'secondary',
		'success',
		'danger',
		'warning',
		'info',
		'light',
		'dark'
	];

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
	var fragment = root_12();
	var main = $.first_child(fragment);
	var section = $.sibling($.child(main), 2);
	var node = $.sibling($.child(section), 2);

	Accordion(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node_1 = $.first_child(fragment_1);

			AccordionItem(node_1, {
				active: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Fallbrook');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					header: ($$anchor, $$slotProps) => {
						var h4 = root();

						$.append($$anchor, h4);
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);

			AccordionItem(node_2, {
				children: ($$anchor, $$slotProps) => {
					var a = root_1();

					$.append($$anchor, a);
				},

				$$slots: {
					default: true,
					header: ($$anchor, $$slotProps) => {
						var h4_1 = root_2();

						$.append($$anchor, h4_1);
					}
				}
			});

			var node_3 = $.sibling(node_2, 2);

			AccordionItem(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('UCSB Library');

					$.append($$anchor, text_1);
				},

				$$slots: {
					default: true,
					header: ($$anchor, $$slotProps) => {
						var h4_2 = root_3();

						$.append($$anchor, h4_2);
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var node_4 = $.sibling($.child(section_1), 2);

	$.each(node_4, 17, () => colors, $.index, ($$anchor, color) => {
		Alert($$anchor, {
			get color() {
				return $.get(color);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_5();
				var h4_3 = $.first_child(fragment_3);
				var text_2 = $.only_child(h4_3, true);

				$.next(3);
				$.template_effect(() => $.set_text(text_2, $.get(color)));
				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var node_5 = $.sibling($.child(section_2), 2);

	$.each(node_5, 17, () => colors, $.index, ($$anchor, color) => {
		Badge($$anchor, {
			get color() {
				return $.get(color);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_3 = $.text();

				$.template_effect(() => $.set_text(text_3, $.get(color)));
				$.append($$anchor, text_3);
			},
			$$slots: { default: true }
		});
	});

	$.reset(section_2);

	var section_3 = $.sibling(section_2, 2);
	var node_6 = $.sibling($.child(section_3), 2);

	Breadcrumb(node_6, {
		children: ($$anchor, $$slotProps) => {
			BreadcrumbItem($$anchor, {
				active: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Home');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Breadcrumb(node_7, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_7();
			var node_8 = $.first_child(fragment_7);

			BreadcrumbItem(node_8, {
				children: ($$anchor, $$slotProps) => {
					var a_1 = root_6();

					$.append($$anchor, a_1);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			BreadcrumbItem(node_9, {
				active: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Library');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_7, 2);

	Breadcrumb(node_10, {
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_4();
			var node_11 = $.first_child(fragment_8);

			BreadcrumbItem(node_11, {
				children: ($$anchor, $$slotProps) => {
					var a_2 = root_6();

					$.append($$anchor, a_2);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_11, 2);

			BreadcrumbItem(node_12, {
				children: ($$anchor, $$slotProps) => {
					var a_3 = root_8();

					$.append($$anchor, a_3);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			BreadcrumbItem(node_13, {
				active: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Data');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	$.reset(section_3);

	var section_4 = $.sibling(section_3, 2);
	var node_14 = $.sibling($.child(section_4), 2);

	Button(node_14, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Hello World');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 2);

	Button(node_15, {
		color: 'primary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Hello World');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_15, 2);

	Button(node_16, {
		color: 'warning',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Hello World');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_16, 2);

	Button(node_17, {
		color: 'danger',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Hello World');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_17, 2);

	Button(node_18, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Hello World');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	$.reset(section_4);

	var section_5 = $.sibling(section_4, 2);
	var node_19 = $.sibling($.child(section_5), 2);

	ButtonGroup(node_19, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_4();
			var node_20 = $.first_child(fragment_9);

			Button(node_20, {
				color: 'primary',
				active: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('Alpha');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			var node_21 = $.sibling(node_20, 2);

			Button(node_21, {
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('Bravo');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			var node_22 = $.sibling(node_21, 2);

			Button(node_22, {
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('Charlie');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	$.reset(section_5);

	var section_6 = $.sibling(section_5, 2);
	var node_23 = $.sibling($.child(section_6), 2);

	ButtonToolbar(node_23, {
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_4();
			var node_24 = $.first_child(fragment_10);

			Button(node_24, {
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('File');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			var node_25 = $.sibling(node_24, 2);

			Button(node_25, {
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_16 = $.text('Edit');

					$.append($$anchor, text_16);
				},
				$$slots: { default: true }
			});

			var node_26 = $.sibling(node_25, 2);

			Button(node_26, {
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_17 = $.text('View');

					$.append($$anchor, text_17);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	$.reset(section_6);

	var section_7 = $.sibling(section_6, 2);
	var node_27 = $.sibling($.child(section_7), 2);

	Card(node_27, {
		class: 'mb-3',
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root_4();
			var node_28 = $.first_child(fragment_11);

			CardHeader(node_28, {
				children: ($$anchor, $$slotProps) => {
					CardTitle($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_18 = $.text('Card title');

							$.append($$anchor, text_18);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_29 = $.sibling(node_28, 2);

			CardBody(node_29, {
				children: ($$anchor, $$slotProps) => {
					var fragment_13 = root_4();
					var node_30 = $.first_child(fragment_13);

					CardSubtitle(node_30, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_19 = $.text('Card subtitle');

							$.append($$anchor, text_19);
						},
						$$slots: { default: true }
					});

					var node_31 = $.sibling(node_30, 2);

					CardText(node_31, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_20 = $.text('Some quick example text to build on the card title and make up the bulk of the card\'s content.');

							$.append($$anchor, text_20);
						},
						$$slots: { default: true }
					});

					var node_32 = $.sibling(node_31, 2);

					Button(node_32, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_21 = $.text('Button');

							$.append($$anchor, text_21);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});

			var node_33 = $.sibling(node_29, 2);

			CardFooter(node_33, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_22 = $.text('Footer');

					$.append($$anchor, text_22);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	$.reset(section_7);

	var section_8 = $.sibling(section_7, 2);
	var div = $.sibling($.child(section_8), 2);
	var div_1 = $.child(div);
	var node_34 = $.child(div_1);

	Carousel(node_34, {
		get items() {
			return items;
		},

		get activeIndex() {
			return activeIndex;
		},

		set activeIndex($$value) {
			activeIndex = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_14 = root_10();
			var node_35 = $.first_child(fragment_14);

			CarouselIndicators(node_35, {
				get items() {
					return items;
				},

				get activeIndex() {
					return activeIndex;
				},

				set activeIndex($$value) {
					activeIndex = $$value;
				}
			});

			var div_2 = $.sibling(node_35, 2);

			$.each(div_2, 21, () => carouselItems, $.index, ($$anchor, item, index) => {
				CarouselItem($$anchor, {
					itemIndex: index,
					get activeIndex() {
						return activeIndex;
					},

					set activeIndex($$value) {
						activeIndex = $$value;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_16 = root_9();
						var img = $.first_child(fragment_16);
						var node_36 = $.sibling(img, 2);

						CarouselCaption(node_36, {
							get captionHeader() {
								return $.get(item).title;
							},

							get captionText() {
								return $.get(item).subTitle;
							}
						});

						$.template_effect(() => {
							$.set_attribute(img, 'src', $.get(item).url);
							$.set_attribute(img, 'alt', $.get(item).title);
						});

						$.append($$anchor, fragment_16);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_2);

			var node_37 = $.sibling(div_2, 2);

			CarouselControl(node_37, {
				direction: 'prev',
				get items() {
					return items;
				},

				get activeIndex() {
					return activeIndex;
				},

				set activeIndex($$value) {
					activeIndex = $$value;
				}
			});

			var node_38 = $.sibling(node_37, 2);

			CarouselControl(node_38, {
				direction: 'next',
				get items() {
					return items;
				},

				get activeIndex() {
					return activeIndex;
				},

				set activeIndex($$value) {
					activeIndex = $$value;
				}
			});

			$.append($$anchor, fragment_14);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section_8);

	var section_9 = $.sibling(section_8, 2);
	var node_39 = $.sibling($.child(section_9), 2);

	Dropdown(node_39, {
		get isOpen() {
			return isDropdownOpen;
		},
		toggle: () => isDropdownOpen = !isDropdownOpen,
		children: ($$anchor, $$slotProps) => {
			var fragment_17 = root_7();
			var node_40 = $.first_child(fragment_17);

			DropdownToggle(node_40, {
				color: 'primary',
				caret: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_23 = $.text('Dropdown');

					$.append($$anchor, text_23);
				},
				$$slots: { default: true }
			});

			var node_41 = $.sibling(node_40, 2);

			DropdownMenu(node_41, {
				children: ($$anchor, $$slotProps) => {
					var fragment_18 = root_11();
					var node_42 = $.first_child(fragment_18);

					DropdownItem(node_42, {
						header: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_24 = $.text('Header');

							$.append($$anchor, text_24);
						},
						$$slots: { default: true }
					});

					var node_43 = $.sibling(node_42, 2);

					DropdownItem(node_43, {
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_25 = $.text('Action');

							$.append($$anchor, text_25);
						},
						$$slots: { default: true }
					});

					var node_44 = $.sibling(node_43, 2);

					DropdownItem(node_44, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_26 = $.text('Another Action');

							$.append($$anchor, text_26);
						},
						$$slots: { default: true }
					});

					var node_45 = $.sibling(node_44, 2);

					DropdownItem(node_45, { divider: true });

					var node_46 = $.sibling(node_45, 2);

					DropdownItem(node_46, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_27 = $.text('Another Action');

							$.append($$anchor, text_27);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_18);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_17);
		},
		$$slots: { default: true }
	});

	$.reset(section_9);
	$.reset(main);

	var node_47 = $.sibling(main, 2);

	Styles(node_47, {});
	$.append($$anchor, fragment);
}