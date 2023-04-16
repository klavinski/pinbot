module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
    },
    plugins: [
        "@typescript-eslint",
        "react"
    ],
    rules: {
        "@typescript-eslint/require-array-sort-compare": "warn",
        "@typescript-eslint/object-curly-spacing": [ "warn", "always" ],
        "@typescript-eslint/space-before-blocks": [ "warn", "always" ],
        "@typescript-eslint/type-annotation-spacing": "warn",
        "array-bracket-spacing": [ "warn", "always" ],
        "arrow-spacing": [ "warn", { before: true, after: true } ],
        "block-spacing": [ "warn", "always" ],
        "comma-spacing": [ "warn", { before: false, after: true } ],
        "computed-property-spacing": [ "warn", "always" ],
        "generator-star-spacing": [ "warn", { before: true, after: true } ],
        "indent": [ "warn", 4 ],
        "key-spacing": [ "warn", { beforeColon: false, afterColon: true } ],
        "keyword-spacing": [ "warn", { before: true, after: true } ],
        "no-multi-spaces": [ "warn", { ignoreEOLComments: true } ],
        "no-trailing-spaces": [ "warn" ],
        "no-whitespace-before-property": [ "warn" ],
        "object-curly-spacing": "off",
        "quotes": [ "warn", "double" ],
        "react/jsx-curly-spacing": [ "warn", { when: "always", children: true } ],
        "react/jsx-equals-spacing": [ "warn", "never" ],
        "react/jsx-tag-spacing": [ "warn", { "closingSlash": "never", "beforeSelfClosing": "never", "afterOpening": "never", "beforeClosing": "never" } ],
        "react/self-closing-comp": [ "warn", { component: true, html: true } ],
        "rest-spread-spacing": [ "warn", "never" ],
        "semi": [ "warn", "never" ],
        "semi-spacing": [ "warn", { before: false, after: true } ],
        "sort-imports": [ "warn", { ignoreCase: true, ignoreDeclarationSort: true, ignoreMemberSort: false } ],
        "space-before-blocks": "off",
        "space-before-function-paren": [ "warn", { anonymous: "never", named: "never" } ],
        "space-in-parens": [ "warn", "always" ],
        "space-infix-ops": [ "warn" ],
        "space-unary-ops": [ "warn", { words: true, nonwords: true } ],
        "spaced-comment": [ "warn", "always" ],
        "switch-colon-spacing": [ "warn", { after: true, before: false } ],
        "template-curly-spacing": [ "warn", "always" ],
        "template-tag-spacing": [ "warn", "never" ],
        "yield-star-spacing": [ "warn", { before: true, after: true } ]
    },
}
