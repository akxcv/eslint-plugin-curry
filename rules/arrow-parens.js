'use strict';

function isOpeningParenToken(token) {
  return token.value === '(' && token.type === 'Punctuator';
}

module.exports = {
  meta: {
    docs: {
      description: 'require parentheses around arrow function arguments',
      category: 'ECMAScript 6',
      recommended: false,
    },

    fixable: 'code',

    schema: [
      {
        enum: ['always', 'as-needed'],
      },
      {
        type: 'object',
        properties: {
          requireForBlockBody: {
            type: 'boolean',
          },
          curry: {
            enum: ['always', 'never'],
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create: function(context) {
    var message = 'Expected parentheses around arrow function argument.';
    var asNeededMessage =
      'Unexpected parentheses around single function argument.';
    var asNeeded = context.options[0] === 'as-needed';
    var requireForBlockBodyMessage =
      'Unexpected parentheses around single function argument having a body with no curly braces';
    var requireForBlockBodyNoParensMessage =
      'Expected parentheses around arrow function argument having a body with curly braces.';
    var requireForCurryingMessage =
      'Unexpected parentheses around single curried function argument';
    var requireForCurryingNoParensMessage =
      'Expected parentheses around curried function argument';
    var requireForBlockBody =
      asNeeded &&
      context.options[1] &&
      context.options[1].requireForBlockBody === true;
    var checkCurrying = !!(context.options[1] && context.options[1].curry);
    var requireForCurrying = checkCurrying
      ? context.options[1].curry === 'always'
      : !asNeeded;

    var sourceCode = context.getSourceCode();

    /**
     * Determines whether a arrow function argument end with `)`
     * @param {ASTNode} node The arrow function node.
     * @returns {void}
     */
    function parens(node) {
      var token = sourceCode.getFirstToken(node, node.async ? 1 : 0);
      var isCurrying =
        node.parent.type === 'ArrowFunctionExpression' ||
        node.body.type === 'ArrowFunctionExpression';

      if (checkCurrying && isCurrying) {
        if (
          node.params.length === 1 &&
          node.params[0].type === 'Identifier' &&
          !node.params[0].typeAnnotation &&
          !node.returnType
        ) {
          if (requireForCurrying && !isOpeningParenToken(token)) {
            context.report({
              node: node,
              message: requireForCurryingNoParensMessage,
              fix: function fix(fixer) {
                return fixer.replaceText(token, `(${token.value})`);
              },
            });
          }

          if (!requireForCurrying && isOpeningParenToken(token)) {
            context.report({
              node: node,
              message: requireForCurryingMessage,
              fix: function fix(fixer) {
                var paramToken = context.getTokenAfter(token);
                var closingParenToken = context.getTokenAfter(paramToken);

                return fixer.replaceTextRange(
                  [token.range[0], closingParenToken.range[1]],
                  paramToken.value
                );
              },
            });
          }
        }
      } else {
        // "as-needed", { "requireForBlockBody": true }: x => x
        if (
          requireForBlockBody &&
          node.params.length === 1 &&
          node.params[0].type === 'Identifier' &&
          !node.params[0].typeAnnotation &&
          node.body.type !== 'BlockStatement' &&
          !node.returnType
        ) {
          if (isOpeningParenToken(token)) {
            context.report({
              node: node,
              message: requireForBlockBodyMessage,
              fix: function fix(fixer) {
                var paramToken = context.getTokenAfter(token);
                var closingParenToken = context.getTokenAfter(paramToken);

                return fixer.replaceTextRange(
                  [token.range[0], closingParenToken.range[1]],
                  paramToken.value
                );
              },
            });
          }
          return;
        }

        if (requireForBlockBody && node.body.type === 'BlockStatement') {
          if (!isOpeningParenToken(token)) {
            context.report({
              node: node,
              message: requireForBlockBodyNoParensMessage,
              fix: function fix(fixer) {
                return fixer.replaceText(token, `(${token.value})`);
              },
            });
          }
          return;
        }

        // "as-needed": x => x
        if (
          asNeeded &&
          node.params.length === 1 &&
          node.params[0].type === 'Identifier' &&
          !node.params[0].typeAnnotation &&
          !node.returnType
        ) {
          if (isOpeningParenToken(token)) {
            context.report({
              node: node,
              message: asNeededMessage,
              fix: function fix(fixer) {
                var paramToken = context.getTokenAfter(token);
                var closingParenToken = context.getTokenAfter(paramToken);

                return fixer.replaceTextRange(
                  [token.range[0], closingParenToken.range[1]],
                  paramToken.value
                );
              },
            });
          }
          return;
        }

        if (token.type === 'Identifier') {
          var after = sourceCode.getTokenAfter(token);

          // (x) => x
          if (after.value !== ')') {
            context.report({
              node: node,
              message: message,
              fix: function fix(fixer) {
                return fixer.replaceText(token, `(${token.value})`);
              },
            });
          }
        }
      }
    }

    return {
      ArrowFunctionExpression: parens,
    };
  },
};
