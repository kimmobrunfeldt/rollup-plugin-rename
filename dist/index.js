"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewrite = exports.getExportSource = exports.getImportSource = exports.getRequireSource = exports.isEmpty = void 0;
var pluginutils_1 = require("@rollup/pluginutils");
var estree_walker_1 = require("estree-walker");
var magic_string_1 = __importDefault(require("magic-string"));
var NodeType;
(function (NodeType) {
    NodeType["Literal"] = "Literal";
    NodeType["CallExpression"] = "CallExpression";
    NodeType["Identifier"] = "Identifier";
    NodeType["ImportDeclaration"] = "ImportDeclaration";
    NodeType["ExportNamedDeclaration"] = "ExportNamedDeclaration";
    NodeType["ExportAllDeclaration"] = "ExportAllDeclaration";
})(NodeType || (NodeType = {}));
function isEmpty(array) {
    return !array || array.length === 0;
}
exports.isEmpty = isEmpty;
function getRequireSource(node) {
    if (node.type !== NodeType.CallExpression) {
        return false;
    }
    if (node.callee.type !== NodeType.Identifier || isEmpty(node.arguments)) {
        return false;
    }
    var args = node.arguments;
    if (node.callee.name !== 'require' || args[0].type !== NodeType.Literal) {
        return false;
    }
    return args[0];
}
exports.getRequireSource = getRequireSource;
function getImportSource(node) {
    if (node.type !== NodeType.ImportDeclaration || node.source.type !== NodeType.Literal) {
        return false;
    }
    return node.source;
}
exports.getImportSource = getImportSource;
function getExportSource(node) {
    var exportNodes = [NodeType.ExportAllDeclaration, NodeType.ExportNamedDeclaration];
    if (!exportNodes.includes(node.type) || !node.source || node.source.type !== NodeType.Literal) {
        return false;
    }
    return node.source;
}
exports.getExportSource = getExportSource;
function rewrite(input, map) {
    return map(input);
}
exports.rewrite = rewrite;
function rename(options) {
    var filter = pluginutils_1.createFilter(options.include, options.exclude);
    var sourceMaps = options.sourceMap !== false;
    return {
        name: 'rename-rollup',
        generateBundle: function (_, bundle) {
            var files = Object.entries(bundle);
            var _loop_1 = function (key, file) {
                if (!filter(file.facadeModuleId)) {
                    return "continue";
                }
                file.facadeModuleId = rewrite(file.facadeModuleId, options.map) || file.facadeModuleId;
                file.fileName = rewrite(file.fileName, options.map) || file.fileName;
                file.imports.map(function (imported) {
                    if (!filter(imported)) {
                        return imported;
                    }
                    return rewrite(imported, options.map) || imported;
                });
                if (file.code) {
                    var magicString_1 = new magic_string_1.default(file.code);
                    var ast = this_1.parse(file.code, {
                        ecmaVersion: 6,
                        sourceType: 'module',
                    });
                    estree_walker_1.walk(ast, {
                        enter: function (node) {
                            if ([
                                NodeType.ImportDeclaration,
                                NodeType.CallExpression,
                                NodeType.ExportAllDeclaration,
                                NodeType.ExportNamedDeclaration,
                            ].includes(node.type)) {
                                var req = getRequireSource(node) || getImportSource(node) || getExportSource(node);
                                if (req) {
                                    var start = req.start, end = req.end;
                                    var newPath = rewrite(req.value, options.map);
                                    magicString_1.overwrite(start, end, "'" + newPath + "'");
                                }
                            }
                        },
                    });
                    if (sourceMaps) {
                        file.map = magicString_1.generateMap();
                    }
                    file.code = magicString_1.toString();
                }
                delete bundle[key];
                bundle[rewrite(key, options.map) || key] = file;
            };
            var this_1 = this;
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var _a = files_1[_i], key = _a[0], file = _a[1];
                _loop_1(key, file);
            }
        },
    };
}
exports.default = rename;
