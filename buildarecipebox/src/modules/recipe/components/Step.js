import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from '../../../components';

class Step extends Component {
  render() {
    return (
      <div className="input-group mb-3">
        <div className="input-group-prepend">
          <span className="input-group-text" id="stepAddon">
            {this.props.step}
          </span>
        </div>
        <input
          type="text"
          className="form-control"
          aria-describedby="stepAddon"
          value={this.props.desp}
          onChange={e => this.props.onChange(e)}
          placeholder="new step"
        />
        <div className="input-group-append">
          <Button onClick={this.props.onDelete} className="input-group-text">
            X
          </Button>
        </div>
      </div>
    );
  }
}

export default Step;