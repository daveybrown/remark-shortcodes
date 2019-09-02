const visit = require('unist-util-visit');
const findBefore = require('unist-util-find-before');

/*

  myMarkdown could contain something like [[block]]inner[[/block]]
  the block should be parsed correctly

  Use like this:
   <ReactMarkdown
      source={myMarkdown}
      astPlugins={[enclosingShortcodesAst()]}
      plugins={[shortcodes]}
      renderers={{ shortcode: Shortcode }}
    />
*/

module.exports = {
  enclosingShortcodesAst
};

function enclosingShortcodesAst() {
  function transformer(tree) {
    visit(
      tree,
      'shortcode',
      function (node, index, parent) {
        if (node.isClosing == true) {
          const end = node;
          const isStart = node =>
            node &&
            node.type === 'shortcode' &&
            node.identifier === end.identifier;
          const start = findBefore(parent, end, isStart);

          const startIndex = parent.children.indexOf(start);
          const endIndex = index;

          const between = parent.children.slice(startIndex + 1, endIndex);

          parent.children[startIndex] = {
            type: 'shortcode',
            children: between,
            identifier: start.identifier,
            attributes: start.attributes,
            position: node.position
          };

          for (i = startIndex + 1; i <= endIndex; i++) {
            delete parent.children[i];
          }
        }
      },
      true
    );
    return tree;
  }

  return transformer;
}
