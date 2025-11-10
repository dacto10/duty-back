/* eslint-disable n/no-unpublished-import */
import js from "@eslint/js";
import nodePlugin from "eslint-plugin-n";
import globals from "globals";

export default [
    js.configs.recommended,

    nodePlugin.configs["flat/recommended-script"],

    {
        files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: "module",
            globals: { ...globals.node } 
        },
        rules: {
            "no-console": "off",
            "n/no-unsupported-features/node-builtins": "error",
            "n/prefer-global/buffer": ["error", "always"],
            "quotes": ["error", "double"],
            "object-curly-spacing": ["error", "always"],
            "indent": ["off", "always"],
            "linebreak-style": ["off", "windows"],
        }
    }
];
