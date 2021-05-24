import React from "react"
import Helmet from "react-helmet"

export default class TestPage2 extends React.Component {
  render() {
    return <div>
      <Helmet>
        <title>Demo Site 2</title>
      </Helmet>

      <h1> Foo Bar </h1>
    </div>
  }
}