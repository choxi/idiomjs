const fs = require("fs")
const path = require("path")
const pascalCase = require("pascalcase")
const componentsDir = path.join(".", "components")
const pagesDir = path.join(".", "pages")

class Project {
  pages() {
    const pagePaths = fs.readdirSync(pagesDir)
    return pagePaths.map(p => {
      const name = p.split(".")[0]
      const klass = pascalCase(name)
      const body = fs.readFileSync(`./pages/${ p }`)

      return {
        name: name,
        path: p,
        klass: klass,
        body: body
      }
    })
  }

  components() {
    const componentPaths = fs.readdirSync(componentsDir)
                             .filter(p => p.split(".")[1] === "jsx")

    return componentPaths.map(path => {
      const tag = path.split(".")[0]
      const klass = pascalCase(tag)

      return {
        tag: tag,
        klass: klass,
        path: path
      }
    })
  }
}

module.exports = Project