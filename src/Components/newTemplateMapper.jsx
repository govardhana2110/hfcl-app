import React, { Component } from 'react';

class NestedJsonComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: {},
      templateData: this.props.data,
    };
  }

  handleCollapse = (key) => {
    this.setState((prevState) => ({
      collapsed: {
        ...prevState.collapsed,
        [key]: !prevState.collapsed[key],
      },
    }));
  };

  handleChange = (e, path) => {
    const { templateData } = this.state;
    const { value } = e.target;

    const updatedData = this.updateDataAtPath(templateData, path, value);

    this.setState({
      templateData: updatedData,
    });
  };

  updateDataAtPath(data, path, value) {
    const keys = path.split('.');
    let current = { ...data };

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = value;
      } else {
        current[key] = { ...current[key] };
        current = current[key];
      }
    });

    return { ...data };
  }

  handleItemClick = (e, key) => {
    if (e.target.tagName !== 'INPUT') {
      this.handleCollapse(key);
    }
  };

  renderData(data, currentKey = '') {
    const { collapsed } = this.state;

    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return (
          <ul>
            {data.map((item, index) => (
              <li key={index}>{this.renderData(item, `${currentKey}[${index}]`)}</li>
            ))}
          </ul>
        );
      } else {
        return (
          <ul>
            {Object.entries(data).map(([key, value]) => (
              key !== '@xmlns' ? (
                <li key={key} onClick={(event) => this.handleItemClick(event, `${currentKey}.${key}`)}>
                  <strong>{key}: </strong>
                  {!collapsed[`${currentKey}.${key}`] && this.renderData(value, `${currentKey}.${key}`)}
                </li>
              ) : null
            ))}
          </ul>
        );
      }
    } else {
      return (
        <input
          type="text"
          value={data || ''}
          onChange={(e) => this.handleChange(e, currentKey)}
        />
      );
    }
  }

  render() {
    const { templateData } = this.state;

    return <div>{this.renderData(templateData)}</div>;
  }
}

export default NestedJsonComponent;
