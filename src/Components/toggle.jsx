import React, { Component } from 'react';

class Toggle extends Component {
  render() {
    const { onChange, label, toggled } = this.props;

    return (
      <div className="togglerIcon devicelisttoggle">
        <label>
          <input type="checkbox" defaultChecked={toggled} onChange={onChange} />
          <span />
          <strong>{label}</strong>
        </label>
      </div>
    );
  }
}

export default Toggle;
