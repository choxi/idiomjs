var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};
__markAsModule(exports);
__export(exports, {
  default: () => TestPage2
});
var import_react = __toModule(require("react"));
var import_react_helmet = __toModule(require("react-helmet"));
class TestPage2 extends import_react.default.Component {
  render() {
    return /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement(import_react_helmet.default, null, /* @__PURE__ */ import_react.default.createElement("title", null, "Demo Site 2")), /* @__PURE__ */ import_react.default.createElement("h1", null, " Foo Bar "));
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});