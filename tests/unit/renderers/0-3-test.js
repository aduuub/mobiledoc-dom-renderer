/* global QUnit */

import Renderer from 'mobiledoc-dom-renderer';
import ImageCard from 'mobiledoc-dom-renderer/cards/image';
import { RENDER_TYPE } from 'mobiledoc-dom-renderer';
import {
  MARKUP_SECTION_TYPE,
  LIST_SECTION_TYPE,
  CARD_SECTION_TYPE,
  IMAGE_SECTION_TYPE
} from 'mobiledoc-dom-renderer/utils/section-types';

const { test, module } = QUnit;
const MOBILEDOC_VERSION = '0.3.0';
const dataUri = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";

import {
  MARKUP_MARKER_TYPE,
  ATOM_MARKER_TYPE
} from 'mobiledoc-dom-renderer/utils/marker-types';

let renderer;
module('Unit: Mobiledoc DOM Renderer - 0.3', {
  beforeEach() {
    renderer = new Renderer();
  }
});

test('renders an empty mobiledoc', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: []
  };
  let { result: rendered } = renderer.render(mobiledoc);

  assert.ok(!!rendered, 'renders result');
  assert.equal(rendered.childNodes.length, 0, 'has no sections');
});

test('renders a mobiledoc without markups', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [MARKUP_MARKER_TYPE, [], 0, 'hello world']]
      ]
    ]
  };
  let renderResult = renderer.render(mobiledoc);
  let { result: rendered } = renderResult;
  assert.equal(rendered.childNodes.length, 1,
               'renders 1 section');
  assert.equal(rendered.childNodes[0].tagName, 'P',
               'renders a P');
  assert.equal(rendered.childNodes[0].textContent, 'hello world',
               'renders the text');
});

test('renders a mobiledoc with simple (no attributes) markup', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [
      ['B']
    ],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [MARKUP_MARKER_TYPE, [0], 1, 'hello world']]
      ]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered.childNodes.length, 1,
               'renders 1 section');
  let sectionEl = rendered.childNodes[0];

  assert.equal(sectionEl.innerHTML, '<b>hello world</b>');
});

test('renders a mobiledoc with complex (has attributes) markup', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [
      ['A', ['href', 'http://google.com']],
    ],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [MARKUP_MARKER_TYPE, [0], 1, 'hello world']
      ]]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered.childNodes.length, 1,
               'renders 1 section');
  let sectionEl = rendered.childNodes[0];

  assert.equal(sectionEl.innerHTML, '<a href="http://google.com">hello world</a>');
});

test('renders a mobiledoc with multiple markups in a section', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [
      ['B'],
      ['I']
    ],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [MARKUP_MARKER_TYPE, [0], 0, 'hello '], // b
        [MARKUP_MARKER_TYPE, [1], 0, 'brave '], // b+i
        [MARKUP_MARKER_TYPE, [], 1, 'new '], // close i
        [MARKUP_MARKER_TYPE, [], 1, 'world'] // close b
      ]]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered.childNodes.length, 1,
               'renders 1 section');
  let sectionEl = rendered.childNodes[0];

  assert.equal(sectionEl.innerHTML, '<b>hello <i>brave new </i>world</b>');
});

test('renders a mobiledoc with image section', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [IMAGE_SECTION_TYPE, dataUri]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered.childNodes.length, 1,
               'renders 1 section');
  let sectionEl = rendered.childNodes[0];

  assert.equal(sectionEl.src, dataUri);
});

test('renders a mobiledoc with built-in image card', (assert) => {
  assert.expect(3);
  let cardName = ImageCard.name;
  let payload = { src: dataUri };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [cardName, payload]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered.childNodes.length, 1,
               'renders 1 section');
  let sectionEl = rendered.childNodes[0];

  assert.equal(sectionEl.firstChild.tagName, 'IMG');
  assert.equal(sectionEl.firstChild.src, dataUri);
});

test('render mobiledoc with list section and list items', (assert) => {
  const mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [LIST_SECTION_TYPE, 'ul', [
        [[MARKUP_MARKER_TYPE, [], 0, 'first item']],
        [[MARKUP_MARKER_TYPE, [], 0, 'second item']]
      ]]
    ]
  };
  let { result: rendered } = renderer.render(mobiledoc, document.createElement('div'));
  assert.equal(rendered.childNodes.length, 1, 'renders 1 section');

  const section = rendered.childNodes[0];
  assert.equal(section.tagName, 'UL');

  const items = section.childNodes;
  assert.equal(items.length, 2, '2 list items');

  assert.equal(items[0].tagName, 'LI', 'correct tagName for item 1');
  assert.equal(items[0].childNodes[0].textContent, 'first item',
               'correct text node for item 1');

  assert.equal(items[1].tagName, 'LI', 'correct tagName for item 2');
  assert.equal(items[1].childNodes[0].textContent, 'second item',
               'correct text node for item 2');
});

test('renders a mobiledoc with card section', (assert) => {
  assert.expect(7);
  let cardName = 'title-card';
  let expectedPayload = { name: 'bob' };
  let expectedOptions = { foo: 'bar' };
  let TitleCard = {
    name: cardName,
    type: 'dom',
    render: ({env, payload, options}) => {
      assert.deepEqual(payload, expectedPayload, 'correct payload');
      assert.deepEqual(options, expectedOptions, 'correct options');
      assert.equal(env.name, cardName, 'correct name');
      assert.ok(!env.isInEditor, 'isInEditor correct');
      assert.ok(!!env.onTeardown, 'has onTeardown hook');

      return document.createTextNode(payload.name);
    }
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [cardName, expectedPayload]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };

  renderer = new Renderer({cards: [TitleCard], cardOptions: expectedOptions});
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered.childNodes.length, 1, 'renders 1 section');
  let sectionEl = rendered.childNodes[0];

  assert.equal(sectionEl.innerHTML, expectedPayload.name);
});

test('throws when given invalid card type', (assert) => {
  let cardName = 'bad';
  let card = {
    name: cardName,
    type: 'text',
    render() {}
  };
  let cards = [card];
  assert.throws(
    () => { new Renderer({cards}) }, // jshint ignore: line
    new RegExp(`Card "${cardName}" must be of type "${RENDER_TYPE}"`)
  );
});

test('throws when given card without `render`', (assert) => {
  let cardName = 'bad';
  let card = {
    name: cardName,
    type: RENDER_TYPE,
    render: undefined
  };
  let cards = [card];
  assert.throws(
    () => { new Renderer({cards}) }, // jshint ignore: line
    new RegExp(`Card "${cardName}" must define \`render\``)
  );
});

test('throws if card render returns invalid result', (assert) => {
  let card = {
    name: 'bad',
    type: 'dom',
    render() { return 'string'; }
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [card.name]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };

  renderer = new Renderer({cards:[card]});
  assert.throws(
    () => renderer.render(mobiledoc),
    /Card "bad" must render dom/
  );
});

test('card may render nothing', (assert) => {
  let card = {
    name: 'ok',
    type: 'dom',
    render() {}
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [card.name]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };

  renderer = new Renderer({cards:[card]});
  renderer.render(mobiledoc);

  assert.ok(true, 'No error thrown');
});

test('rendering nested mobiledocs in cards', (assert) => {
  let renderer;
  let cards = [{
    name: 'nested-card',
    type: 'dom',
    render({payload}) {
      let {result: rendered} = renderer.render(payload.mobiledoc);
      return rendered;
    }
  }];

  let innerMobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [MARKUP_MARKER_TYPE, [], 0, 'hello world']]
      ]
    ]
  };

  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      ['nested-card', {mobiledoc: innerMobiledoc}]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };

  renderer = new Renderer({cards});
  let { result: rendered } = renderer.render(mobiledoc);
  assert.equal(rendered.childNodes.length, 1, 'renders 1 section');
  let card = rendered.childNodes[0];
  assert.equal(card.childNodes.length, 1, 'card has 1 child');
  assert.equal(card.childNodes[0].tagName, 'P', 'card has P child');
  assert.equal(card.childNodes[0].innerText, 'hello world');
});

test('rendering unknown card without unknownCardHandler throws', (assert) => {
  let cardName = 'not-known';
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [cardName]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };
  renderer = new Renderer({cards: [], unknownCardHandler: undefined});
  assert.throws(
    () => renderer.render(mobiledoc),
    new RegExp(`Card "${cardName}" not found.*no unknownCardHandler`)
  );
});

test('rendering unknown card uses unknownCardHandler', (assert) => {
  assert.expect(5);

  let cardName = 'my-card';
  let expectedOptions = {};
  let expectedPayload = {};

  let unknownCardHandler = ({env, options, payload}) => {
    assert.equal(env.name, cardName, 'name is correct');
    assert.ok(!env.isInEditor, 'not in editor');
    assert.ok(!!env.onTeardown, 'has onTeardown');

    assert.deepEqual(options, expectedOptions, 'correct options');
    assert.deepEqual(payload, expectedPayload, 'correct payload');
  };

  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [cardName, expectedPayload]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };
  renderer = new Renderer({
    cards: [], cardOptions: expectedOptions, unknownCardHandler
  });
  renderer.render(mobiledoc);
});

test('throws if given an object of cards', (assert) => {
  let cards = {};
  assert.throws(
    () => { new Renderer({cards}) }, // jshint ignore: line
    new RegExp('`cards` must be passed as an array')
  );
});

test('teardown removes rendered sections from dom', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'p', [
        [MARKUP_MARKER_TYPE, [], 0, 'Hello world']
      ]]
    ]
  };

  let { result: rendered, teardown } = renderer.render(mobiledoc);
  assert.equal(rendered.childNodes.length, 1, 'renders 1 section');

  let fixture = document.getElementById('qunit-fixture');
  fixture.appendChild(rendered);

  assert.ok(fixture.childNodes.length === 1, 'precond - result is appended');

  teardown();

  assert.ok(fixture.childNodes.length === 0, 'rendered result removed after teardown');
});

test('teardown hook calls registered teardown methods', (assert) => {
  let cardName = 'title-card';
  let didTeardown = false;

  let card = {
    name: cardName,
    type: 'dom',
    render({env}) {
      env.onTeardown(() => didTeardown = true);
    }
  };

  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [
      [cardName]
    ],
    markups: [],
    sections: [
      [CARD_SECTION_TYPE, 0]
    ]
  };

  renderer = new Renderer({cards: [card]});
  let { teardown } = renderer.render(mobiledoc);

  assert.ok(!didTeardown, 'teardown not called');

  teardown();

  assert.ok(didTeardown, 'teardown called');
});

test('multiple spaces should preserve whitespace with nbsps', (assert) => {
  let space = ' ';
  let repeat = (str, count) => {
    let result = '';
    while (count--) {
      result += str;
    }
    return result;
  };
  let text = [
    repeat(space, 4), 'some',
    repeat(space, 5), 'text',
    repeat(space, 6)
  ].join('');
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [MARKUP_MARKER_TYPE, [], 0, text]]
      ]
    ]
  };

  let nbsp = '\u00A0';
  let sn = space + nbsp;
  let expectedText = [
    repeat(sn, 2), 'some',
    repeat(sn, 2), space, 'text',
    repeat(sn, 3)
  ].join('');
  let { result: rendered } = renderer.render(mobiledoc);
  let textNode = rendered.firstChild.firstChild;
  assert.equal(textNode.textContent, expectedText, 'renders the text');
});

test('throws when given unexpected mobiledoc version', (assert) => {
  let mobiledoc = {
    version: '0.1.0',
    atoms: [],
    cards: [],
    markups: [],
    sections: []
  };

  assert.throws(
    () => renderer.render(mobiledoc),
    /Unexpected Mobiledoc version.*0.1.0/
  );

  mobiledoc.version = '0.2.1';
  assert.throws(
    () => renderer.render(mobiledoc),
    /Unexpected Mobiledoc version.*0.2.1/
  );
});

test('XSS: unexpected markup and list section tag names are not renderered', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'script', [
        [MARKUP_MARKER_TYPE, [], 0, 'alert("markup section XSS")']
      ]],
      [LIST_SECTION_TYPE, 'script', [
        [[MARKUP_MARKER_TYPE, [], 0, 'alert("list section XSS")']]
      ]]
    ]
  };
  let { result } = renderer.render(mobiledoc);
  let scripts = result.querySelectorAll('script');
  assert.ok(!scripts.length, 'no script tag rendered');
  document.getElementById('qunit-fixture').appendChild(result);
});

test('XSS: unexpected markup types are not rendered', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [
      ['b'], // valid
      ['em'], // valid
      ['script'] // invalid
    ],
    sections: [
      [MARKUP_SECTION_TYPE, 'p', [
        [MARKUP_MARKER_TYPE, [0], 0, 'bold text'],
        [MARKUP_MARKER_TYPE, [1,2], 3, 'alert("markup XSS")'],
        [MARKUP_MARKER_TYPE, [], 0, 'plain text']
      ]]
    ]
  };
  let { result } = renderer.render(mobiledoc);
  let script = result.querySelector('script');
  assert.ok(!script, 'no script tags rendered');
  document.getElementById('qunit-fixture').appendChild(result);
});



test('renders a mobiledoc with atom', (assert) => {
  let atomName = 'hello-atom';
  let atom = {
    name: atomName,
    type: 'dom',
    render({ value }) {
      return document.createTextNode(`Hello ${value}`);
    }
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['hello-atom', 'Bob', { id: 42 }],
    ],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [ATOM_MARKER_TYPE, [], 0, 0]]
      ]
    ]
  };
  renderer = new Renderer({atoms: [atom]});
  let { result: rendered } = renderer.render(mobiledoc);

  let sectionEl = rendered.childNodes[0];
  assert.equal(sectionEl.textContent, 'Hello Bob');
});


test('throws when given atom with invalid type', (assert) => {
  let atom = {
    name: 'bad',
    type: 'other',
    render() {}
  };
  assert.throws(
    () => { new Renderer({atoms: [atom]}); }, // jshint ignore:line
    /Atom "bad" must be type "dom"/
  );
});

test('throws when given atom without `render`', (assert) => {
  let atom = {
    name: 'bad',
    type: 'dom',
    render: undefined
  };
  assert.throws(
    () => { new Renderer({atoms: [atom]}); }, // jshint ignore:line
    /Atom "bad" must define.*render/
  );
});

test('throws if atom render returns invalid result', (assert) => {
  let atom = {
    name: 'bad',
    type: 'dom',
    render() { return 'string'; }
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['bad', 'Bob', { id: 42 }],
    ],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [ATOM_MARKER_TYPE, [], 0, 0]]
      ]
    ]
  };
  renderer = new Renderer({atoms: [atom]});
  assert.throws(
    () => renderer.render(mobiledoc),
    /Atom "bad" must render dom/
  );
});

test('atom may render nothing', (assert) => {
  let atom = {
    name: 'ok',
    type: 'dom',
    render() {}
  };
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['ok', 'Bob', { id: 42 }],
    ],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [ATOM_MARKER_TYPE, [], 0, 0]]
      ]
    ]
  };

  renderer = new Renderer({atoms:[atom]});
  renderer.render(mobiledoc);

  assert.ok(true, 'No error thrown');
});

test('throws when rendering unknown atom without unknownAtomHandler', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['missing-atom', 'Bob', { id: 42 }],
    ],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [ATOM_MARKER_TYPE, [], 0, 0]]
      ]
    ]
  };
  renderer = new Renderer({atoms: [], unknownAtomHandler: undefined});
  assert.throws(
    () => renderer.render(mobiledoc),
    /Atom "missing-atom" not found.*no unknownAtomHandler/
  );
});

test('rendering unknown atom uses unknownAtomHandler', (assert) => {
  assert.expect(4);

  let atomName = 'missing-atom';
  let expectedPayload = { id: 42 };
  let cardOptions = {};
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [
      ['missing-atom', 'Bob', { id: 42 }],
    ],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [ATOM_MARKER_TYPE, [], 0, 0]]
      ]
    ]
  };
  let unknownAtomHandler = ({env, payload, options}) => {
    assert.equal(env.name, atomName, 'correct name');
    assert.ok(!!env.onTeardown, 'onTeardown hook exists');

    assert.deepEqual(payload, expectedPayload, 'correct payload');
    assert.deepEqual(options, cardOptions, 'correct options');
  };
  renderer = new Renderer({atoms: [], unknownAtomHandler, cardOptions});
  renderer.render(mobiledoc);
});

test('renders a mobiledoc with sectionElementRenderer', (assert) => {
  let mobiledoc = {
    version: MOBILEDOC_VERSION,
    atoms: [],
    cards: [],
    markups: [],
    sections: [
      [MARKUP_SECTION_TYPE, 'P', [
        [MARKUP_MARKER_TYPE, [], 0, 'hello world']]
      ],
      [MARKUP_SECTION_TYPE, 'p', [
        [MARKUP_MARKER_TYPE, [], 0, 'hello world']]
      ],
      [MARKUP_SECTION_TYPE, 'h1', [
        [MARKUP_MARKER_TYPE, [], 0, 'hello world']]
      ]
    ]
  };
  renderer = new Renderer({
    sectionElementRenderer: {
      p: () => document.createElement('pre'),
      H1: () => document.createElement('h2')
    }
  });
  let renderResult = renderer.render(mobiledoc);
  let { result: rendered } = renderResult;
  assert.equal(rendered.childNodes.length, 3,
               'renders three sections');
  assert.equal(rendered.childNodes[0].tagName, 'PRE',
               'renders a pre');
  assert.equal(rendered.childNodes[0].textContent, 'hello world',
               'renders the text');
  assert.equal(rendered.childNodes[1].tagName, 'PRE',
               'renders a pre');
  assert.equal(rendered.childNodes[2].tagName, 'H2',
               'renders an h2');
});