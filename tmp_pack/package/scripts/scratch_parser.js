const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = `
import { something } from './my-module';
const x = require('another-module');
export class MyClass {}
export function myFunc() {}
export const myArrow = async () => {};
`;

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['typescript']
});

const exportsList = [];
const importsList = [];

traverse(ast, {
  ExportNamedDeclaration(path) {
    const decl = path.node.declaration;
    if (decl) {
      if (decl.type === 'ClassDeclaration' && decl.id) {
        exportsList.push('class ' + decl.id.name);
      } else if (decl.type === 'FunctionDeclaration' && decl.id) {
        exportsList.push('function ' + decl.id.name);
      } else if (decl.type === 'VariableDeclaration') {
        decl.declarations.forEach(d => {
          if (d.id) exportsList.push('const ' + d.id.name);
        });
      }
    }
  },
  ImportDeclaration(path) {
    importsList.push(path.node.source.value);
  },
  CallExpression(path) {
    if (path.node.callee.name === 'require' && path.node.arguments.length > 0) {
      if (path.node.arguments[0].type === 'StringLiteral') {
        importsList.push(path.node.arguments[0].value);
      }
    }
  }
});

console.log('Exports:', exportsList);
console.log('Imports:', importsList);
