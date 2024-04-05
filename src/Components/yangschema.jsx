import React from 'react';
import yangjs from 'yangjs';
import schemaText from './my-schema.yang';

class MyComponent extends React.Component {
  constructor(props) {
    super(props);

    // Parse the schema using Yang-js
    const schema = yangjs.parse(schemaText);

    // Find a node by path
    const node = schema.findNode('/my-module:my-container/my-list');

    // Determine if the node is a list or leaf-list
    if (node.key) {
      // Handle list node
      this.state = {
        isList: true,
      };
    } else {
      // Handle leaf-list node
      this.state = {
        isList: false,
      };
    }
  }

  render() {
    return (
      <div>
        {this.state.isList ? (
          <p>This node is a list</p>
        ) : (
          <p>This node is a leaf-list</p>
        )}
      </div>
    );
  }
}

export default MyComponent;
