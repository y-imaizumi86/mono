module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-recess-order',
    'stylelint-config-prettier-scss',
  ],
  rules: {
    // Tailwind v4 用の特例設定
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'theme',
          'layer',
          'config',
          'utility',
          'variant',
          'custom-variant',
          'plugin',
        ],
      },
    ],
    // クラス名の命名規則（Tailwind使うので緩くしておく）
    'selector-class-pattern': null,
    // 空のソースがあってもエラーにしない
    'no-empty-source': null,
    // フォント名の大文字小文字を無視 (Menloなどを許容)
    'value-keyword-case': null,
    // 最新の色指定(oklch)などの記法チェックを無効化
    'color-function-notation': null,
    'alpha-value-notation': null,
    'hue-degree-notation': null,
    'lightness-notation': null,
    // カスタムプロパティのパターンチェックを無効化 (--radius-md など)
    'custom-property-pattern': null,
    // Importの順序チェックを無効化（Tailwind v4の@import順序を守るため）
    'no-invalid-position-at-import-rule': null,
    // 未知の関数を許容 (theme()など)
    'function-no-unknown': null,
    // 不正な @import を許容（Tailwind v4のCSSファイルをimportするため）
    'scss/no-global-function-names': null,
  },
  overrides: [
    {
      files: ['*.astro', '**/*.astro'],
      customSyntax: 'postcss-html',
    },
  ],
};
