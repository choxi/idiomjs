import React from "react"
import Helmet from "react-helmet"

export default class TestPage extends React.Component {
  render() {
    return <div>
      <Helmet>
        <title>Demo Site</title>
      </Helmet>

      <h1> Hello World </h1>
    </div>
  }
}